import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getPipelineStages, sendMail } from '../../services/api';
import {
  Users, Search, ArrowRight, Mail, Tag, X, CheckCircle2,
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2,
  Strikethrough, Code, Minus, RotateCcw, RotateCw,
  Underline as UnderlineIcon, Link2, Palette, Highlighter,
  Table as TableIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextAlign } from '@tiptap/extension-text-align';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const STAGE_COLORS = [
  'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60',
];

export default function Guests() {
  const { tenant } = useAuth();
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGuests, setSelectedGuests] = useState(null);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSendSuccess] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const COLORS = [
    '#000000', '#424242', '#757575', '#bdbdbd', '#eeeeee', '#ffffff',
    '#d32f2f', '#f44336', '#f06292', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setReminderMessage(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm dark:prose-invert focus:outline-none max-w-none p-6 min-h-[300px] text-sm leading-relaxed',
      }
    }
  });


  const handleOpenReminder = (e, guest) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedGuests(guest);
    setSendSuccess(false);

    const initialMsg = `<p>Hi <strong>${guest.name}</strong>,</p><p>This is a friendly reminder regarding our upcoming podcast. We are looking forward to it!</p><p>Best,</p><p><strong>${tenant?.name || 'The Team'}</strong></p>`;
    setReminderMessage(initialMsg);
    if (editor) {
      editor.commands.setContent(initialMsg);
    }

  };

  const handleSendReminder = async () => {
    setSending(true);

    await sendMail(tenant.id, {
      entityType: 'guest',
      entityId: selectedGuests.id,
      body: reminderMessage
    });
    setSending(false);
    setSendSuccess(true);

    setTimeout(() => {
      setSelectedGuests(null);
      setSendSuccess(false);
    }, 2000);




  }





  useEffect(() => {
    if (!tenant?.id) return;
    Promise.all([getGuests(tenant.id), getPipelineStages(tenant.id)])
      .then(([g, s]) => { setGuests(g); setStages(s); })
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  const stageMap = Object.fromEntries(stages.map((s, i) => [s.id, { label: s.label, color: STAGE_COLORS[i % STAGE_COLORS.length] }]));
  const filtered = guests.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white min-h-[calc(100vh-64px)] flex flex-col">

      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-7 flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={12} className="text-blue-500 dark:text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">People</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Guests.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{guests.length} total guests registered</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…"
                className={`pl-10 pr-4 py-2 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white w-52 transition-all focus:w-64 placeholder:text-black/30 dark:placeholder:text-white/20`} />
            </div>
            <Link to="/admin/guests" className={`border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
              + Add Guest
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x ${DIVIDER} border-t ${DIVIDER}`}>
          {[
            { label: 'Total Guests', value: guests.length },
            { label: 'Stages Active', value: stages.length },
            { label: 'Unassigned', value: guests.filter(g => !g.stageId).length },
          ].map(({ label, value }) => (
            <div key={label} className="relative overflow-hidden p-6 group group-hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">{label}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CONTENT GRID ══════════════════════════════════════════════════ */}
      <div className={`flex-1 border-b ${DIVIDER}`}>
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
            <Users size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No guests found</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map((g) => {
              const stage = stageMap[g.stageId];
              return (
                <Link key={g.id} to={`/app/guests/${g.id}`}
                  className={`relative p-6 border-b sm:border-r ${DIVIDER} hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>

                  <div className="h-12 w-12 bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] uppercase font-extrabold text-black dark:text-white mb-5 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/20">
                    {g.name.slice(0, 2)}
                  </div>

                  <h3 className="text-sm font-bold text-black dark:text-white truncate">{g.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Mail size={10} className="text-black/30 dark:text-white/20 flex-none" />
                    <p className="text-xs font-bold text-black/40 dark:text-white/30 tracking-widest uppercase truncate">{g.email}</p>
                  </div>

                  {stage && (
                    <div className="mt-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${stage.color}`}>
                        <Tag size={8} /> {stage.label}
                      </span>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">{new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <button onClick={(e) => handleOpenReminder(e, g)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors">  <Mail size={10} /> Follow Ups <ArrowRight size={10} /></button>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors">View <ArrowRight size={10} /></span>
                  </div>

                </Link>
              );
            })}
          </div>
        )}
      </div>


      {/* ══ POPUP MODAL ══════════════════════════════════════════════════ */}
      {selectedGuests && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`bg-white dark:bg-[#0f1117] border ${DIVIDER} w-full max-w-5xl h-[85vh] shadow-2xl overflow-auto`}>

            <div className={`p-6 border-b ${DIVIDER} flex items-center justify-between`}>
              <h2 className="text-xs font-extrabold uppercase tracking-widest">Send Reminder</h2>
              <button onClick={() => setSelectedGuests(null)}><X size={16} /></button>
            </div>

            <div className="p-6">
              {sentSuccess ? (
                <div className="py-8 text-center animate-pulse text-green-500">
                  <CheckCircle2 size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase">Reminder Sent!</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-bold uppercase dark:text-white text-black/40 mb-4 tracking-widest">
                    To: {selectedGuests.name} ({selectedGuests.email})
                  </p>
                  {/* <textarea
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    rows={6}
                    className={`w-full p-4 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-medium focus:outline-none focus:border-black dark:focus:border-white resize-none`}
                  /> */}
                  {/* 1. Remove the old textarea entirely */}

                  {/* 2. Use the corrected ReactQuill syntax */}
                  <div className={`mt-2 border  h-[55vh] ${DIVIDER} rounded-sm overflow-hidden bg-white/5 flex flex-col flex-1 shadow-inner`}>
                    {/* ══ TOOLBAR ══════════════════════════════════════════ */}
                    <div className={`flex flex-wrap items-center gap-0.5 p-1.5 border-b ${DIVIDER} bg-black/[0.03] dark:bg-white/[0.04]`}>

                      {/* History */}
                      <div className="flex items-center gap-0.5 mr-2">
                        <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors" title="Undo"><RotateCcw size={14} /></button>
                        <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors" title="Redo"><RotateCw size={14} /></button>
                      </div>

                      <div className={`w-px h-4 mr-2 bg-black/10 dark:bg-white/10`} />

                      {/* Text Style */}
                      <div className="flex items-center gap-0.5 mr-2">
                        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('bold') ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><Bold size={14} /></button>
                        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('italic') ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><Italic size={14} /></button>
                        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('underline') ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><UnderlineIcon size={14} /></button>
                        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('strike') ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><Strikethrough size={14} /></button>
                      </div>

                      <div className={`w-px h-4 mr-2 bg-black/10 dark:bg-white/10`} />

                      {/* Headings */}
                      <div className="flex items-center gap-0.5 mr-2">
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><Heading1 size={14} /></button>
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><Heading2 size={14} /></button>
                      </div>

                      <div className={`w-px h-4 mr-2 bg-black/10 dark:bg-white/10`} />

                      {/* Alignment */}
                      <div className="flex items-center gap-0.5 mr-2">
                        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded transition-colors ${editor?.isActive({ textAlign: 'left' }) ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><AlignLeft size={14} /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded transition-colors ${editor?.isActive({ textAlign: 'center' }) ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><AlignCenter size={14} /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded transition-colors ${editor?.isActive({ textAlign: 'right' }) ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><AlignRight size={14} /></button>
                      </div>

                      <div className={`w-px h-4 mr-2 bg-black/10 dark:bg-white/10`} />

                      {/* Color & Highlight */}
                      <div className="flex items-center gap-0.5 mr-2 relative">
                        <div className="relative">
                          <button
                            onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
                            className={`p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors ${showColorPicker ? 'bg-black/10 dark:bg-white/10' : ''}`}
                            title="Text Color"
                          >
                            <Palette size={14} />
                          </button>
                          {showColorPicker && (
                            <div className={`absolute top-full left-0 mt-2 p-2 bg-white dark:bg-[#0f1117] border ${DIVIDER} shadow-xl z-50 grid grid-cols-6 gap-1 w-36 rounded-md`}>
                              {COLORS.map(color => (
                                <button
                                  key={color}
                                  onClick={() => { editor.chain().focus().setColor(color).run(); setShowColorPicker(false); }}
                                  className="w-4 h-4 rounded-full border border-black/10 hover:scale-125 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
                            className={`p-1.5 rounded transition-colors ${editor?.isActive('highlight') || showHighlightPicker ? 'bg-yellow-200 text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
                            title="Highlight"
                          >
                            <Highlighter size={14} />
                          </button>
                          {showHighlightPicker && (
                            <div className={`absolute top-full left-0 mt-2 p-2 bg-white dark:bg-[#0f1117] border ${DIVIDER} shadow-xl z-50 grid grid-cols-6 gap-1 w-36 rounded-md`}>
                              {COLORS.map(color => (
                                <button
                                  key={color}
                                  onClick={() => { editor.chain().focus().toggleHighlight({ color }).run(); setShowHighlightPicker(false); }}
                                  className="w-4 h-4 rounded-sm border border-black/10 hover:scale-125 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                              <button
                                onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
                                className="col-span-6 text-[8px] font-bold uppercase tracking-widest p-1 hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`w-px h-4 mr-2 bg-black/10 dark:bg-white/10`} />

                      {/* Lists & Quotes */}
                      <div className="flex items-center gap-0.5 mr-2">
                        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('bulletList') ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><List size={14} /></button>
                        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('orderedList') ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><ListOrdered size={14} /></button>
                        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('blockquote') ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}><Quote size={14} /></button>
                      </div>

                      <div className={`w-px h-4 mr-2 bg-black/10 dark:bg-white/10`} />

                      {/* Table & Links */}
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => {
                          const url = prompt('Enter URL:');
                          if (url) editor.chain().focus().setLink({ href: url }).run();
                        }} className={`p-1.5 rounded transition-colors ${editor?.isActive('link') ? 'bg-blue-500 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'}`} title="Add Link"><Link2 size={14} /></button>
                        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors" title="Insert Table"><TableIcon size={14} /></button>
                      </div>
                    </div>

                    {/* ══ EDITOR CONTENT ═══════════════════════════════════ */}
                    <div className="flex-1 overflow-y-auto bg-white/5 dark:bg-white/[0.02]">
                      <EditorContent editor={editor} />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                    <button onClick={() => setSelectedGuests(null)} className="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-widest border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
                    <button
                      onClick={handleSendReminder}
                      disabled={sending}
                      className="px-8 py-2.5 text-[10px] font-extrabold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="h-3 w-3 border-2 border-white/20 border-t-white dark:border-black/20 dark:border-t-black animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Mail size={12} />
                          <span>Send Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
