import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase'; 
import { X, Plus, Upload, User, Bell, AlertCircle, Smile, HardDrive, MessageSquare, Database, Megaphone, FileText, Trash2, RefreshCw, Settings, Clipboard, Copy, Scissors, Edit2, Trash, LayoutGrid, LogOut, Activity, ScrollText } from 'lucide-react';

// --- Constants ---
const MAX_STORAGE_BYTES = 10 * 1024 * 1024; // 10MB Total
const SYSTEM_RESERVED_BYTES = 2 * 1024 * 1024; // 2MB for "ZoeOS Code"
const STORAGE_SAFETY_LIMIT = MAX_STORAGE_BYTES * 0.9;
const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; 
const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😎', '🤔', '👋', '💩', '📷', '📍', '🚀', '💻', '🍕', '☕'];

const DEFAULT_APP_POSITIONS = {
    finder: { x: 20, y: 20 },
    messenger: { x: 20, y: 120 },
    storage: { x: 20, y: 220 },
    announce: { x: 20, y: 320 },
    activity: { x: 20, y: 420 },
    settings: { x: 120, y: 20 },
    recycle: { x: 120, y: 120 },
};

// --- PIXEL ICONS ---
const PixelComputer = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="drop-shadow-md"><path d="M2 4h20v14H2V4zm2 2v10h16V6H4z" fill="#FCE7F3" /><path d="M6 8h12v6H6V8z" fill="#A5F3FC" /><rect x="8" y="18" width="8" height="2" fill="#FBCFE8" /><rect x="6" y="20" width="12" height="2" fill="#FBCFE8" /><rect x="2" y="4" width="20" height="14" stroke="#831843" strokeWidth="2" shapeRendering="crispEdges" /><rect x="6" y="20" width="12" height="2" stroke="#831843" strokeWidth="2" shapeRendering="crispEdges" /></svg>);
const PixelFolder = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="drop-shadow-md"><path d="M2 6h8l2 2h10v12H2V6z" fill="#FDB4D1" /><path d="M2 9h20v9H2V9z" fill="#FF69B4" /><path d="M2 6h8l2 2h10v12H2V6z" stroke="#831843" strokeWidth="2" shapeRendering="crispEdges" /><rect x="5" y="11" width="14" height="2" fill="#FFFFFF" fillOpacity="0.5"/></svg>);
const PixelMessenger = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="drop-shadow-md"><path d="M2 4h20v14H2V4z" fill="#E9D5FF" /><path d="M4 18v4l4-4" fill="#E9D5FF" /><path d="M8 9h2v2H8V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9z" fill="#9333EA" /><path d="M2 4h20v14H2V4z" stroke="#6B21A8" strokeWidth="2" shapeRendering="crispEdges" /><path d="M4 18v4l4-4" stroke="#6B21A8" strokeWidth="2" shapeRendering="crispEdges" /></svg>);
const PixelStorage = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="drop-shadow-md"><path d="M4 4h16v16H4V4z" fill="#D1FAE5" /><path d="M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z" fill="#6EE7B7" /><rect x="4" y="4" width="16" height="16" stroke="#065F46" strokeWidth="2" shapeRendering="crispEdges" /><path d="M4 8h16M4 14h16" stroke="#065F46" strokeWidth="2" shapeRendering="crispEdges" /></svg>);
const PixelAnnounce = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="drop-shadow-md"><path d="M4 8h4l6-4v16l-6-4H4V8z" fill="#FECACA" /><path d="M19 8v8" stroke="#DC2626" strokeWidth="2" shapeRendering="crispEdges" /><path d="M22 6v12" stroke="#DC2626" strokeWidth="2" shapeRendering="crispEdges" /><path d="M4 8h4l6-4v16l-6-4H4V8z" stroke="#991B1B" strokeWidth="2" shapeRendering="crispEdges" /></svg>);
const PixelTrash = ({ full }) => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="drop-shadow-md"><path d="M6 6h12v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6z" fill={full ? "#EF4444" : "#E5E7EB"} /><path d="M4 4h16v2H4V4z" fill="#9CA3AF" /><path d="M8 2h8v2H8V2z" fill="#9CA3AF" /><path d="M10 8v10" stroke="#4B5563" strokeWidth="2" shapeRendering="crispEdges" /><path d="M14 8v10" stroke="#4B5563" strokeWidth="2" shapeRendering="crispEdges" /><rect x="6" y="6" width="12" height="14" stroke="#374151" strokeWidth="2" shapeRendering="crispEdges" /></svg>);
const PixelSettings = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="drop-shadow-md"><path d="M4 4h16v16H4V4z" fill="#E5E7EB" /><path d="M6 6h12v12H6V6z" fill="#9CA3AF" /><path d="M8 8h8v8H8V8z" fill="#4B5563" /><rect x="4" y="4" width="16" height="16" stroke="#1F2937" strokeWidth="2" shapeRendering="crispEdges" /></svg>);
const PixelFile = ({ type }) => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="drop-shadow-sm"><path d="M4 2h10l6 6v14H4V2z" fill="white" /><path d="M14 2v6h6" stroke="#4B5563" strokeWidth="2" shapeRendering="crispEdges" /><rect x="4" y="2" width="16" height="20" stroke="#4B5563" strokeWidth="2" shapeRendering="crispEdges" />{type === 'image' ? <rect x="8" y="10" width="8" height="8" fill="#FCA5A5" /> : <><rect x="7" y="10" width="10" height="2" fill="#9CA3AF" /><rect x="7" y="14" width="10" height="2" fill="#9CA3AF" /><rect x="7" y="18" width="6" height="2" fill="#9CA3AF" /></>}</svg>);
const PixelActivity = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="drop-shadow-md"><path d="M4 4h16v16H4V4z" fill="#FEF3C7" /><rect x="4" y="4" width="16" height="16" stroke="#D97706" strokeWidth="2" shapeRendering="crispEdges" /><path d="M6 8h12M6 12h8M6 16h10" stroke="#D97706" strokeWidth="2" shapeRendering="crispEdges" /></svg>);

// --- Components ---
const BevelButton = ({ onClick, children, className = "", disabled = false }) => (
  <button onClick={onClick} disabled={disabled} className={`border-2 flex items-center justify-center px-2 py-1 text-sm select-none ${disabled ? 'border-gray-400 text-gray-500 bg-gray-200 cursor-not-allowed' : 'border-t-white border-l-white border-r-black border-b-black bg-gray-300 active:border-t-black active:border-l-black active:border-r-white active:border-b-white hover:bg-gray-200'} ${className}`}>{children}</button>
);

const Window = ({ title, isOpen, onClose, children, width = "w-2/3", height = "h-3/4", initialX = 50, initialY = 50, onContextMenu, onDropFile }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => { if (isDragging) setPosition({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y }); };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div 
        className={`absolute z-50 bg-gray-200 border-2 border-t-white border-l-white border-r-black border-b-black flex flex-col shadow-xl ${width} ${height}`} 
        style={{ left: position.x, top: position.y }} 
        onContextMenu={onContextMenu}
    >
      <div onMouseDown={handleMouseDown} className="bg-gradient-to-r from-[#000080] to-[#1084d0] p-1 flex justify-between select-none text-white font-bold text-sm items-center cursor-move">
        <span className="pl-1 flex items-center gap-2">{title}</span>
        <div className="flex gap-1" onMouseDown={e => e.stopPropagation()}><BevelButton onClick={onClose} className="w-5 h-5 !p-0 text-black flex items-center justify-center font-bold"><X size={10} /></BevelButton></div>
      </div>
      <div 
        className="flex-1 overflow-hidden flex flex-col p-1 bg-gray-100 border-2 border-t-black border-l-black border-r-white border-b-white m-1 relative"
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={e => { 
            e.preventDefault(); e.stopPropagation();
            if (onDropFile) onDropFile(e);
        }}
      >
        {children}
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, announcements }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLoginClick = () => {
        if (!username.trim()) { setError("Username is required."); return; }
        if (username.toLowerCase() === 'zoe') {
            if (password === 'zoe1234') onLogin({ name: 'Zoe', role: 'admin' });
            else setError("Access Denied: Incorrect password for admin.");
        } else {
            onLogin({ name: username, role: 'user' });
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#008080] flex items-center justify-center font-sans">
             <div className="bg-gray-200 border-2 border-t-white border-l-white border-r-black border-b-black p-1 shadow-2xl w-[400px]">
                <div className="bg-[#000080] text-white p-1 mb-4 flex justify-between items-center"><span className="font-bold text-sm pl-1">Welcome to zoeOS</span></div>
                <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-4"><div className="p-2 border border-gray-400 rounded bg-gray-100"><User size={32} className="text-gray-600" /></div><div><div className="font-bold text-sm">Log on to zoeOS</div><div className="text-xs text-gray-500">Enter a user name to begin.</div></div></div>
                    <div className="space-y-2 mt-2">
                        <div><label className="text-xs font-bold block mb-1">User name:</label><input type="text" value={username} onChange={e => {setUsername(e.target.value); setError('');}} onKeyDown={e => e.key === 'Enter' && handleLoginClick()} className="w-full border border-gray-500 px-1 py-0.5 text-sm shadow-inner" /></div>
                        <div><label className="text-xs block mb-1">Password (Optional):</label><input type="password" value={password} onChange={e => {setPassword(e.target.value); setError('');}} onKeyDown={e => e.key === 'Enter' && handleLoginClick()} className="w-full border border-gray-500 px-1 py-0.5 text-sm shadow-inner" /></div>
                    </div>
                    {error && <div className="text-red-600 text-xs font-bold bg-white border border-red-400 p-1">{error}</div>}
                    {announcements.length > 0 && (<div className="bg-yellow-50 border border-yellow-400 p-2 text-xs mt-2"><div className="font-bold text-yellow-800 flex gap-1 mb-1 items-center border-b border-yellow-200 pb-1"><AlertCircle size={12}/> System Messages</div><div className="max-h-20 overflow-auto">{announcements.map(a => (<div key={a.id} className="mb-1 flex gap-2"><span className="font-mono text-gray-500">[{a.time}]</span><span>{a.text ? String(a.text) : '...'}</span></div>))}</div></div>)}
                    <div className="flex justify-between pt-4 border-t border-gray-400 mt-2"><button onClick={() => onLogin({ name: 'Guest', role: 'guest' })} className="text-xs text-blue-800 underline hover:text-blue-600">Guest Login (Read Only)</button><div className="flex gap-2"><BevelButton onClick={handleLoginClick} className="px-6 font-bold border-black">OK</BevelButton></div></div>
                </div>
             </div>
        </div>
    );
};

const ContextMenu = ({ x, y, isOpen, onClose, actions, targetName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed z-[300] bg-gray-200 border-2 border-t-white border-l-white border-r-black border-b-black shadow-xl py-1 w-48 text-sm" style={{ top: y, left: x }} onClick={e => e.stopPropagation()}>
            {targetName && <div className="px-4 py-1 text-gray-500 border-b border-gray-400 mb-1 italic truncate">{targetName}</div>}
            {actions.map((action, i) => (action === 'separator' ? <div key={i} className="border-t border-gray-400 my-1 mx-1"></div> : <button key={i} onClick={() => { action.onClick(); onClose(); }} disabled={action.disabled} className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400 flex items-center gap-2">{action.icon && <span className="w-4">{action.icon}</span>}{action.label}</button>))}
        </div>
    );
};

const InputPopup = ({ isOpen, title, onConfirm, onCancel }) => {
    const [val, setVal] = useState("");
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-gray-200 border-2 border-t-white border-l-white border-r-black border-b-black p-1 shadow-2xl w-80">
                <div className="bg-[#000080] text-white p-1 mb-2 font-bold text-sm">{title}</div>
                <div className="p-2"><input autoFocus className="w-full border p-1 text-sm mb-4" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && onConfirm(val)}/><div className="flex justify-end gap-2"><BevelButton onClick={onCancel}>Cancel</BevelButton><BevelButton onClick={() => onConfirm(val)}>OK</BevelButton></div></div>
            </div>
        </div>
    )
}

// --- MAIN APP ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentPath, setCurrentPath] = useState('root');
  
  // States
  const [openWindows, setOpenWindows] = useState({ finder: false, messenger: false, storage: false, announce: false, recycle: false, settings: false, notepad: false, viewer: false, activity: false });
  const [selectedIds, setSelectedIds] = useState([]); 
  const [newMessage, setNewMessage] = useState("");
  const [announceText, setAnnounceText] = useState("");
  const [wallpaperUrl, setWallpaperUrl] = useState(""); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState([]);
  const [openedFile, setOpenedFile] = useState(null); 
  const [localContent, setLocalContent] = useState(""); 
  
  // App Icon Positions
  const [appPositions, setAppPositions] = useState(DEFAULT_APP_POSITIONS);
  
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, targetId: null, location: null });
  const [showFolderPopup, setShowFolderPopup] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [clipboard, setClipboard] = useState({ ids: [], action: null });

  // App Dragging State
  const [draggingApp, setDraggingApp] = useState(null);
  const appDragOffset = useRef({ x: 0, y: 0 });
  const saveTimeout = useRef(null); 

  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef('root'); // Tracks where files should be uploaded
  const chatEndRef = useRef(null);
  const canEdit = currentUser && currentUser.role !== 'guest';
  const isAdmin = currentUser && currentUser.role === 'admin';

  // --- CALCULATED VALUES (SAFE ID HERE) ---
  const safeId = (id) => String(id || Math.random());
  
  // Calculate Total Usage: System Reserved + File Sizes
  const totalUsed = SYSTEM_RESERVED_BYTES + files.reduce((acc, f) => acc + (f.size || 0), 0);
  const percentUsed = Math.min(100, (totalUsed / MAX_STORAGE_BYTES) * 100);
  const availableBytes = Math.max(0, MAX_STORAGE_BYTES - totalUsed);

  const formatBytes = (bytes) => { 
      if (bytes === 0) return '0 B'; 
      const k = 1024; 
      const sizes = ['B', 'KB', 'MB', 'GB']; 
      const i = Math.floor(Math.log(bytes) / Math.log(k)); 
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; 
  };

  // --- SUPABASE SUBSCRIPTIONS ---
  const fetchData = async (table, setter, sortColumn = 'createdAt', ascending = true) => {
      const { data, error } = await supabase.from(table).select('*').order(sortColumn, { ascending });
      if (!error && data) setter(data.map(d => ({...d, id: safeId(d.id)})));
  };

  // Fetch Wallpaper from DB
  const fetchWallpaper = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'wallpaper').single();
      if(data) setWallpaperUrl(data.value);
  };

  useEffect(() => {
    fetchData('files', setFiles);
    fetchData('messages', setMessages);
    fetchData('announcements', setNotifications, 'createdAt', false);
    fetchData('activity_logs', setLogs, 'timestamp', false);
    fetchWallpaper(); // Load wallpaper on start

    const filesChannel = supabase.channel('files-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => fetchData('files', setFiles)).subscribe();
    const messagesChannel = supabase.channel('messages-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchData('messages', setMessages)).subscribe();
    const announceChannel = supabase.channel('announcements-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchData('announcements', setNotifications, 'createdAt', false)).subscribe();
    const logsChannel = supabase.channel('logs-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => fetchData('activity_logs', setLogs, 'timestamp', false)).subscribe();
    const settingsChannel = supabase.channel('settings-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchWallpaper()).subscribe();

    return () => { 
        supabase.removeChannel(filesChannel);
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(announceChannel);
        supabase.removeChannel(logsChannel);
        supabase.removeChannel(settingsChannel);
    };
  }, []);

  useEffect(() => { if (openWindows.messenger && chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, openWindows.messenger]);

  const logAction = async (action, details) => {
      await supabase.from('activity_logs').insert({ action, details, user: currentUser?.name || 'System', timestamp: Date.now() });
  };

  // Save Wallpaper to DB
  const saveWallpaper = async (url) => {
      if(!url) return;
      await supabase.from('settings').upsert({ key: 'wallpaper', value: url });
      setWallpaperUrl(url); // Optimistic update
      logAction("Changed Wallpaper", "Wallpaper updated");
  };

  // Delete old wallpaper logic
  const deleteOldWallpaper = async () => {
       try {
           const { data } = await supabase.from('settings').select('value').eq('key', 'wallpaper').single();
           if (!data || !data.value) return;

           const oldUrl = data.value;
           // Check if it's stored in our wallpapers folder
           if (oldUrl.includes('zoe_files') && oldUrl.includes('/wallpapers/')) {
               const pathParts = oldUrl.split('zoe_files/'); 
               if (pathParts.length > 1) {
                   const relativePath = decodeURIComponent(pathParts[1]);
                   await supabase.storage.from('zoe_files').remove([relativePath]);
               }
           }
       } catch (err) {
           console.error("Failed to cleanup old wallpaper", err);
       }
   };

  const handleAppDragStart = (e, appId) => {
    e.stopPropagation(); 
    if (!canEdit) return;
    setDraggingApp(appId);
    appDragOffset.current = { x: e.clientX - appPositions[appId].x, y: e.clientY - appPositions[appId].y };
  };

  const handleMouseMove = (e) => {
    if (draggingApp) {
        setAppPositions(prev => ({
            ...prev,
            [draggingApp]: { x: e.clientX - appDragOffset.current.x, y: e.clientY - appDragOffset.current.y }
        }));
    }
  };

  const handleMouseUp = () => setDraggingApp(null);

  const handleSelect = (e, id) => {
      id = safeId(id);
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
      else setSelectedIds([id]);
  };

  const handleBackgroundClick = () => {
      setSelectedIds([]);
      setContextMenu({ ...contextMenu, isOpen: false });
      setShowEmojiPicker(false);
      if (renamingId) handleRename();
  };

  const toggleWindow = (key) => setOpenWindows(prev => ({...prev, [key]: !prev[key]}));
  
  const handleAutoArrange = async () => {
      setAppPositions(DEFAULT_APP_POSITIONS);
      const startX = 220, startY = 20, gapY = 100, gapX = 100, maxY = window.innerHeight - 120;
      let currentX = startX, currentY = startY;
      
      const desktopFiles = files.filter(f => safeId(f.parentId) === 'root' && !f.inTrash);
      for (const f of desktopFiles) {
          await supabase.from('files').update({ position: { x: currentX, y: currentY } }).eq('id', f.id);
          currentY += gapY;
          if (currentY > maxY) { currentY = startY; currentX += gapX; }
      }
      logAction("Auto Arrange", "Desktop icons arranged");
  };

  const handleCreateFolder = async (name) => {
      setShowFolderPopup(false);
      if(!name) return;
      let targetPath = contextMenu.location === 'desktop' ? 'root' : currentPath;
      const defaultPos = contextMenu.location === 'desktop' ? { x: contextMenu.x, y: contextMenu.y } : {x: 100, y: 100};
      await supabase.from('files').insert({
          name, type: 'folder', parentId: targetPath, size: 0, createdAt: Date.now(), createdBy: currentUser?.name || "Zoe", inTrash: false, position: defaultPos
      });
      logAction("Created Folder", `Folder "${name}" created at ${targetPath}`);
  };

  const handleCreateFile = async () => {
      if(!canEdit) return alert("Read Only");
      let targetPath = contextMenu.location === 'desktop' ? 'root' : currentPath;
      const defaultPos = contextMenu.location === 'desktop' ? { x: contextMenu.x, y: contextMenu.y } : {x: 100, y: 100};
      await supabase.from('files').insert({
          name: "New Text File.txt", type: 'text', parentId: targetPath, size: 0, content: '', createdAt: Date.now(), createdBy: currentUser?.name || "Zoe", inTrash: false, position: defaultPos
      });
      logAction("Created File", `New Text File.txt created at ${targetPath}`);
  };

  const handleRename = async () => {
      if(!renamingId || !renameValue.trim()) { setRenamingId(null); return; }
      await supabase.from('files').update({ name: renameValue }).eq('id', renamingId);
      logAction("Renamed Item", `Item ${renamingId} renamed to "${renameValue}"`);
      setRenamingId(null);
  };

  const handleTrash = async (idsToTrash) => {
      if(!idsToTrash.length || !canEdit) return;
      await supabase.from('files').update({ inTrash: true, deletedAt: Date.now() }).in('id', idsToTrash);
      logAction("Moved to Trash", `${idsToTrash.length} item(s) moved to trash`);
      setSelectedIds([]);
  };

  const handleRestore = async (idsToRestore) => {
      await supabase.from('files').update({ inTrash: false, deletedAt: null }).in('id', idsToRestore);
      logAction("Restored Items", `${idsToRestore.length} item(s) restored`);
      setSelectedIds([]);
  };

  const handlePermanentDelete = async (ids) => {
      if(!confirm("Permanently delete these items?")) return;
      
      const filesToDelete = files.filter(f => ids.includes(safeId(f.id)));
      for (const f of filesToDelete) {
          if (f.url) {
             try {
                const pathParts = f.url.split('/');
                const fileName = pathParts[pathParts.length - 1]; 
                if(fileName) await supabase.storage.from('zoe_files').remove([fileName]);
             } catch(e) { console.error("Storage delete fail", e); }
          }
      }

      await supabase.from('files').delete().in('id', ids);
      logAction("Deleted Permanently", `${ids.length} item(s) deleted permanently`);
      setSelectedIds([]);
  };

  const handleCopy = (ids, action) => setClipboard({ ids, action });

  const handlePaste = async () => {
      if (!clipboard.ids.length) return;
      let targetPath = contextMenu.location === 'desktop' ? 'root' : currentPath;
      const defaultPos = contextMenu.location === 'desktop' ? { x: contextMenu.x, y: contextMenu.y } : {x: 100, y: 100};
      
      if (clipboard.action === 'copy') {
          const { data: filesToCopy } = await supabase.from('files').select('*').in('id', clipboard.ids);
          const newFilesData = filesToCopy.map(file => {
              const { id, ...rest } = file;
              return { ...rest, name: `Copy of ${file.name}`, parentId: targetPath, createdAt: Date.now(), createdBy: currentUser?.name || "Zoe", position: defaultPos };
          });
          await supabase.from('files').insert(newFilesData);
          logAction("Pasted (Copy)", `${filesToCopy.length} item(s) copied to ${targetPath}`);
      } else if (clipboard.action === 'cut') {
          await supabase.from('files').update({ parentId: targetPath, position: defaultPos }).in('id', clipboard.ids);
          logAction("Pasted (Cut)", `${clipboard.ids.length} item(s) moved to ${targetPath}`);
          setClipboard({ ids: [], action: null });
      }
  };

  const uploadFile = async (file, targetPath) => {
        try {
            if(totalUsed + file.size > STORAGE_SAFETY_LIMIT) return alert("Storage Safety Warning: 90% limit reached.");

            const filePath = `${Date.now()}_${file.name}`; 
            const { error: uploadError } = await supabase.storage.from('zoe_files').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('zoe_files').getPublicUrl(filePath);
            const defaultPos = targetPath === 'root' ? { x: 100, y: 100 } : {x: 100, y: 100}; 

            await supabase.from('files').insert({
                name: file.name, type: file.type.startsWith('image') ? 'image' : 'text', url: publicUrl, 
                parentId: targetPath, size: file.size, content: '', createdAt: Date.now(), createdBy: currentUser?.name || "Zoe", inTrash: false, position: defaultPos
            });
            logAction("Uploaded File", `File "${file.name}" uploaded to ${targetPath}`);
        } catch (error) {
            alert("Upload Failed: " + error.message);
        }
  }

  const handleUploadInput = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      uploadFile(file, uploadTargetRef.current);
      if(fileInputRef.current) fileInputRef.current.value = '';
  };

  // UPDATED: Deletes old wallpaper, uploads new, sets DB
  const handleWallpaperUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
          // 1. Upload NEW
          const filePath = `wallpapers/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage.from('zoe_files').upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('zoe_files').getPublicUrl(filePath);
          
          // 2. Delete OLD
          await deleteOldWallpaper();

          // 3. Save NEW
          saveWallpaper(publicUrl); 
      } catch (error) {
          alert("Wallpaper Upload Failed: " + error.message);
      }
  };

  const sendMessage = async () => {
      if(!newMessage.trim()) return;
      await supabase.from('messages').insert({ text: newMessage, user: currentUser.name, createdAt: Date.now(), time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
      setNewMessage(""); setShowEmojiPicker(false);
  };

  const postAnnouncement = async () => {
      if(!announceText.trim()) return;
      await supabase.from('announcements').insert({ text: announceText, createdAt: Date.now(), time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
      setAnnounceText("");
      logAction("Broadcast", "System announcement posted");
  };

  const handleSaveFile = (content) => {
    if(!openedFile) return;
    setLocalContent(content);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
        await supabase.from('files').update({ content: content, size: content.length }).eq('id', openedFile.id);
        logAction("Saved File", `Content updated for file ${openedFile.name}`);
    }, 500); 
  };

  const handleOpenFile = (file) => {
    if (file.type === 'folder') { setCurrentPath(safeId(file.id)); setOpenWindows(p => ({...p, finder: true})); }
    else if (file.type === 'image') { setOpenedFile(file); setOpenWindows(p => ({...p, viewer: true})); }
    else { setOpenedFile(file); setLocalContent(file.content || ""); setOpenWindows(p => ({...p, notepad: true})); }
  };

  const handleDragStart = (e, file) => {
      if(!canEdit) return e.preventDefault();
      const fileId = safeId(file.id);
      const draggingIds = selectedIds.includes(fileId) ? selectedIds : [fileId];
      setDraggedFiles(draggingIds);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnDesktop = async (e) => {
      e.preventDefault();
      // Handle Native File Drop
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
              await uploadFile(e.dataTransfer.files[i], 'root');
          }
          return;
      }
      // Handle Internal File Move
      if (!draggedFiles.length) return;
      await supabase.from('files').update({ parentId: 'root', position: { x: e.clientX - 40, y: e.clientY - 40 } }).in('id', draggedFiles);
      logAction("Moved Files", `${draggedFiles.length} item(s) moved to Desktop`);
      setDraggedFiles([]);
  };

  const handleDrop = async (e, targetId) => {
      if(e) { e.preventDefault(); e.stopPropagation(); }
      
      // Handle Native File Drop into Window
      if (e && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const dest = targetId ? safeId(targetId) : currentPath; // If dropped in blank space of window, use current path
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
              await uploadFile(e.dataTransfer.files[i], dest);
          }
          return;
      }

      if (!draggedFiles.length) return;
      
      // Determine destination: if dropped on a folder icon (targetId), use it. Else use current open folder.
      let destination = targetId;
      if (!destination) {
          destination = currentPath;
      }
      const destId = safeId(destination);
      const idsToMove = draggedFiles.filter(id => id !== destId);
      
      if(idsToMove.length > 0) {
          await supabase.from('files').update({ parentId: destId }).in('id', idsToMove);
          logAction("Moved Files", `${idsToMove.length} item(s) moved to folder ${destId}`);
      }
      setDraggedFiles([]);
  };

  const onContextMenu = (e, targetId = null, location = 'explorer') => {
      e.preventDefault();
      targetId = targetId ? safeId(targetId) : null;
      if (targetId && !selectedIds.includes(targetId)) setSelectedIds([targetId]);
      setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetId, location });
  };

  const currentFiles = files.filter(f => safeId(f.parentId) === safeId(currentPath) && !f.inTrash);
  const desktopFiles = files.filter(f => safeId(f.parentId) === 'root' && !f.inTrash);
  const trashFiles = files.filter(f => f.inTrash);
  
  const apps = [
      {id: 'finder', name: 'Explorer', Icon: HardDrive}, {id: 'messenger', name: 'Messenger', Icon: MessageSquare},
      {id: 'storage', name: 'Storage', Icon: Database}, {id: 'announce', name: 'Announce', Icon: Megaphone},
      {id: 'activity', name: 'Activity', Icon: PixelActivity},
      {id: 'settings', name: 'Settings', Icon: Settings}, {id: 'recycle', name: 'Trash', Icon: Trash2}
  ];

  const getMenuActions = () => {
      const isFile = contextMenu.targetId !== null || selectedIds.length > 0;
      const baseActions = [
          { label: 'New Folder', icon: <Plus size={14}/>, onClick: () => setShowFolderPopup(true), disabled: !canEdit },
          { label: 'New Text File', icon: <FileText size={14}/>, onClick: handleCreateFile, disabled: !canEdit },
          'separator',
          { label: 'Paste', icon: <Clipboard size={14}/>, onClick: handlePaste, disabled: !canEdit || !clipboard.ids.length },
          { label: 'Upload', icon: <Upload size={14}/>, onClick: () => { 
              // Set the target based on where we right-clicked
              uploadTargetRef.current = contextMenu.location === 'desktop' ? 'root' : currentPath; 
              fileInputRef.current.click(); 
          }, disabled: !canEdit },
      ];
      const fileActions = [
          { label: 'Open', onClick: () => { const f = files.find(file => safeId(file.id) === (contextMenu.targetId || selectedIds[0])); if (f) handleOpenFile(f); }},
          'separator',
          { label: 'Rename', icon: <Edit2 size={14}/>, onClick: () => { const f = files.find(file => safeId(file.id) === (contextMenu.targetId || selectedIds[0])); if(f) { setRenamingId(safeId(f.id)); setRenameValue(f.name); } }, disabled: !canEdit || selectedIds.length > 1 },
          { label: 'Copy', icon: <Copy size={14}/>, onClick: () => handleCopy(selectedIds.length ? selectedIds : [contextMenu.targetId], 'copy'), disabled: !canEdit },
          { label: 'Cut', icon: <Scissors size={14}/>, onClick: () => handleCopy(selectedIds.length ? selectedIds : [contextMenu.targetId], 'cut'), disabled: !canEdit },
          { label: 'Paste', icon: <Clipboard size={14}/>, onClick: handlePaste, disabled: !canEdit || !clipboard.ids.length },
          'separator',
          { label: 'Delete', icon: <Trash size={14}/>, onClick: () => handleTrash(selectedIds.length ? selectedIds : [contextMenu.targetId]), disabled: !canEdit }
      ];
      return isFile ? fileActions : baseActions;
  };

  return (
    <div 
        className="w-full h-screen overflow-hidden relative flex flex-col bg-[#008080] font-sans select-none" 
        style={{ backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : undefined, backgroundSize: 'cover' }} 
        onClick={handleBackgroundClick} onContextMenu={(e) => { if(e.target === e.currentTarget) onContextMenu(e, null, 'desktop'); }} 
        onDragOver={e => e.preventDefault()} onDrop={handleDropOnDesktop} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
    >
        {!currentUser && <LoginScreen onLogin={setCurrentUser} announcements={notifications} />}
        
        {/* If currentUser is present, render the desktop interface */}
        {currentUser && (
            <>
                <InputPopup isOpen={showFolderPopup} title="Create New Folder" onConfirm={handleCreateFolder} onCancel={() => setShowFolderPopup(false)} />
                <ContextMenu {...contextMenu} onClose={() => setContextMenu({ ...contextMenu, isOpen: false })} actions={getMenuActions()} targetName={selectedIds.length > 1 ? `${selectedIds.length} items` : (contextMenu.targetId ? files.find(f => safeId(f.id) === contextMenu.targetId)?.name : (contextMenu.location === 'desktop' ? 'Desktop' : 'Folder'))} />

                <div className="fixed top-4 right-4 z-[100] w-72 flex flex-col gap-2 items-end pointer-events-none">
                    {notifications.map(n => (
                        <div key={n.id} className="pointer-events-auto bg-yellow-100 border-2 border-yellow-400 text-black p-3 shadow-xl rounded w-full relative animate-in slide-in-from-right fade-in duration-300">
                            <button onClick={() => supabase.from('announcements').delete().eq('id', n.id)} className="absolute top-1 right-1 text-gray-500 hover:text-black"><X size={14}/></button>
                            <div className="flex items-center gap-1 font-bold text-xs text-yellow-800 mb-1"><Bell size={12} /> Announcement • {n.time}</div><div className="text-sm">{n.text}</div>
                        </div>
                    ))}
                </div>

                <div className="absolute inset-0 p-4 pointer-events-none">
                    {apps.map(app => (
                        <div key={app.id} onMouseDown={(e) => handleAppDragStart(e, app.id)} onDoubleClick={(e) => { e.stopPropagation(); toggleWindow(app.id); }} onClick={(e) => e.stopPropagation()} className="absolute flex flex-col items-center w-24 group cursor-pointer hover:bg-white/20 p-2 border border-transparent hover:border-white/20 hover:border-dotted pointer-events-auto" style={{ left: appPositions[app.id].x, top: appPositions[app.id].y }}>
                            {app.id === 'finder' && <PixelComputer />}{app.id === 'messenger' && <PixelMessenger />}{app.id === 'storage' && <PixelStorage />}{app.id === 'announce' && <PixelAnnounce />}{app.id === 'activity' && <PixelActivity />}{app.id === 'recycle' && <PixelTrash full={trashFiles.length > 0}/>}{app.id === 'settings' && <div className="p-2"><Settings size={32} className="text-gray-300"/></div>}
                            <span className="text-white text-xs px-1 mt-1 font-medium bg-black/20 pointer-events-none select-none">{app.name}</span>
                        </div>
                    ))}
                    <div className="absolute inset-0 pointer-events-none">
                        {desktopFiles.map(f => {
                            const idStr = safeId(f.id);
                            return (
                            <div key={idStr} draggable={canEdit} onDragStart={(e) => handleDragStart(e, f)} onContextMenu={(e) => onContextMenu(e, idStr, 'desktop')} onClick={(e) => handleSelect(e, idStr)} onDoubleClick={() => { if (renamingId === idStr) return; handleOpenFile(f); }} onDrop={(e) => f.type === 'folder' ? handleDrop(e, idStr) : null} onDragOver={(e) => f.type === 'folder' ? e.preventDefault() : null} style={{ position: 'absolute', left: f.position ? f.position.x : 100, top: f.position ? f.position.y : 100 }} className={`flex flex-col items-center w-24 group cursor-pointer hover:bg-white/20 p-2 border pointer-events-auto ${selectedIds.includes(idStr) ? 'bg-blue-800/50 border-white border-dotted' : 'border-transparent hover:border-white/20 hover:border-dotted'}`}>
                                {f.type === 'folder' ? <PixelFolder /> : <PixelFile type={f.type} />}
                                {renamingId === idStr ? <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename()} onClick={e => e.stopPropagation()} className="w-full text-xs text-black text-center mt-1"/> : <span onDoubleClick={(e) => { e.stopPropagation(); if(canEdit) { setRenamingId(idStr); setRenameValue(f.name); } }} className="text-white text-xs px-1 mt-1 font-medium bg-black/20 truncate w-full text-center select-none">{f.name}</span>}
                            </div>
                        )})}
                    </div>
                </div>

                <Window title="Control Panel" isOpen={openWindows.settings} onClose={() => toggleWindow('settings')}>
                    <div className="p-4 flex flex-col gap-4">
                        <div className="font-bold text-sm border-b pb-2">Desktop Wallpaper</div>
                        {isAdmin ? (
                            <>
                                <div className="text-xs text-gray-500 mb-2">Paste a URL or upload a file.</div>
                                <div className="flex gap-2 mb-2">
                                    <input className="flex-1 border p-1 text-sm" placeholder="Image URL..." value={wallpaperUrl} onChange={(e) => setWallpaperUrl(e.target.value)} />
                                    <BevelButton onClick={() => saveWallpaper(wallpaperUrl)}>Set URL</BevelButton>
                                </div>
                                <div className="flex gap-2 items-center border-t pt-2">
                                    <span className="text-xs font-bold">Upload:</span>
                                    <input type="file" className="text-xs" onChange={handleWallpaperUpload} />
                                </div>
                            </>
                        ) : (
                            <div className="text-red-600 text-sm font-bold flex items-center gap-2 bg-red-100 p-2 border border-red-300"><X size={14}/> Access Denied: Admin Only</div>
                        )}
                    </div>
                </Window>

                <Window title="File Explorer" isOpen={openWindows.finder} onClose={() => toggleWindow('finder')} onContextMenu={(e) => onContextMenu(e, null, 'explorer')} onDropFile={(e) => handleDrop(e, null)}>
                    <div className="flex gap-1 mb-2 border-b border-gray-400 pb-2">
                        <BevelButton onClick={() => currentPath !== 'root' && setCurrentPath('root')} disabled={currentPath === 'root'}>Back</BevelButton>
                        <div className="w-px bg-gray-400 mx-1"></div>
                        <BevelButton onClick={() => setShowFolderPopup(true)} disabled={!canEdit}><Plus size={12}/> Folder</BevelButton>
                        <BevelButton onClick={() => { uploadTargetRef.current = currentPath; fileInputRef.current.click(); }} disabled={!canEdit}><Upload size={12}/> Upload</BevelButton>
                        {selectedIds.length > 0 && <BevelButton onClick={() => handleTrash(selectedIds)} disabled={!canEdit} className="text-red-600 border-red-200"><Trash2 size={12}/> Delete</BevelButton>}
                        <input type="file" hidden ref={fileInputRef} onChange={handleUploadInput} />
                    </div>
                    <div className="flex flex-wrap gap-4 content-start min-h-[200px] p-2 bg-white border border-gray-400 inset-shadow h-full overflow-auto" onClick={() => setSelectedIds([])}>
                        {currentFiles.length === 0 && <div className="text-gray-500 text-sm p-8 w-full text-center">Directory is empty (Drag files here)</div>}
                        {currentFiles.map(f => {
                            const idStr = safeId(f.id);
                            return (
                            <div key={idStr} draggable={canEdit} onDragStart={(e) => handleDragStart(e, f)} onContextMenu={(e) => onContextMenu(e, idStr, 'explorer')} onClick={(e) => handleSelect(e, idStr)} onDoubleClick={() => { if (renamingId === idStr) return; handleOpenFile(f); }} onDrop={(e) => f.type === 'folder' ? handleDrop(e, idStr) : null} onDragOver={(e) => f.type === 'folder' ? e.preventDefault() : null} className={`flex flex-col items-center w-24 p-2 cursor-pointer border hover:border-dotted hover:border-blue-800 group ${selectedIds.includes(idStr) ? 'bg-blue-200 border-blue-800 border-dotted' : 'border-transparent'}`}>
                                {f.type === 'folder' ? <PixelFolder /> : <PixelFile type={f.type} />}
                                {renamingId === idStr ? <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename()} onClick={e => e.stopPropagation()} className="w-full text-xs text-black text-center mt-2 border border-blue-500"/> : <span onDoubleClick={(e) => { e.stopPropagation(); if(canEdit) { setRenamingId(idStr); setRenameValue(f.name); } }} className="text-white text-xs px-1 mt-1 font-medium bg-black/20 truncate w-full text-center select-none">{f.name}</span>}
                                <span className="text-[9px] text-gray-500 w-full text-center hidden group-hover:block">By {f.createdBy || 'System'}</span>
                            </div>
                        )})}
                    </div>
                </Window>

                <Window title="Notepad" isOpen={openWindows.notepad} onClose={() => {setOpenWindows(p => ({...p, notepad: false})); setOpenedFile(null);}}>
                    <div className="flex flex-col h-full"><textarea className="flex-1 p-2 resize-none border-none outline-none font-mono text-sm" value={localContent} onChange={e => { setLocalContent(e.target.value); handleSaveFile(e.target.value); }} disabled={!canEdit}></textarea></div>
                </Window>

                <Window title="Image Viewer" isOpen={openWindows.viewer} onClose={() => {setOpenWindows(p => ({...p, viewer: false})); setOpenedFile(null);}}>
                    <div className="flex items-center justify-center h-full bg-black">{openedFile && <img src={openedFile.url} alt={openedFile.name} className="max-w-full max-h-full object-contain"/>}</div>
                </Window>

                <Window title="Activity Log" isOpen={openWindows.activity} onClose={() => toggleWindow('activity')}>
                    <div className="flex flex-col h-full bg-white">
                        <div className="bg-gray-100 p-2 border-b font-bold text-xs flex justify-between"><span>User Activity History</span><span>{logs.length} events</span></div>
                        <div className="flex-1 overflow-auto p-0">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-gray-200 sticky top-0"><tr><th className="p-2 border">Time</th><th className="p-2 border">User</th><th className="p-2 border">Action</th><th className="p-2 border">Details</th></tr></thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log.id} className="border-b hover:bg-yellow-50">
                                            <td className="p-2 border-r font-mono text-[10px] whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                            <td className="p-2 border-r font-bold">{log.user}</td>
                                            <td className="p-2 border-r">{log.action}</td>
                                            <td className="p-2 text-gray-600">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {logs.length === 0 && <div className="p-4 text-center text-gray-500 italic">No activity recorded yet.</div>}
                        </div>
                    </div>
                </Window>

                <Window title="Recycle Bin" isOpen={openWindows.recycle} onClose={() => toggleWindow('recycle')}>
                    <div className="flex gap-1 mb-2 border-b border-gray-400 pb-2"><BevelButton onClick={() => handleRestore(trashFiles.map(f => safeId(f.id)))} disabled={!trashFiles.length || !canEdit}><RefreshCw size={12}/> Restore All</BevelButton><BevelButton onClick={() => handlePermanentDelete(trashFiles.map(f => safeId(f.id)))} disabled={!trashFiles.length || !canEdit} className="text-red-600"><Trash2 size={12}/> Empty Bin</BevelButton></div>
                    <div className="flex flex-wrap gap-4 content-start p-2 bg-white h-full overflow-auto">
                        {trashFiles.map(f => { 
                            const idStr = safeId(f.id); 
                            return (
                            <div key={idStr} className="flex flex-col items-center w-24 p-2 opacity-50 cursor-not-allowed">
                                {f.type === 'folder' ? <PixelFolder /> : <PixelFile type={f.type} />}
                                <span className="text-xs truncate w-full text-center mt-2">{f.name}</span>
                                <div className="flex gap-1 mt-1"><button onClick={() => handleRestore([idStr])} className="text-[10px] text-blue-600 underline">Restore</button><button onClick={() => handlePermanentDelete([idStr])} className="text-[10px] text-red-600 underline">Delete</button></div>
                            </div>
                            )
                        })}
                    </div>
                </Window>

                <Window title="Messenger" isOpen={openWindows.messenger} onClose={() => toggleWindow('messenger')}>
                    <div className="flex flex-col h-full bg-white relative">
                        <div className="bg-gray-100 border-b p-2 text-center text-xs text-gray-500">Public Chat Room</div>
                        <div className="flex-1 overflow-auto p-4 space-y-3 bg-white">{messages.map(m => (<div key={safeId(m.id)} className={`flex flex-col ${m.user === currentUser?.name ? 'items-end' : 'items-start'}`}><div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm border shadow-sm ${m.user === currentUser?.name ? 'bg-[#008080] text-white rounded-br-none border-[#006060]' : 'bg-gray-100 text-black rounded-bl-none border-gray-300'}`}>{m.text}</div><span className="text-[10px] text-gray-500 mt-1 px-1">{!(m.user === currentUser?.name) && <span className="font-bold mr-1">{m.user}</span>}{m.time}</span></div>))}<div ref={chatEndRef}></div></div>
                        <div className="p-2 bg-gray-100 border-t flex items-center gap-2 relative">
                            {showEmojiPicker && <div className="absolute bottom-full left-0 mb-2 ml-2 bg-white border-2 border-gray-400 shadow-xl p-2 w-64 grid grid-cols-8 gap-1 z-50" onClick={e => e.stopPropagation()}>{EMOJIS.map(emo => <button key={emo} onClick={() => setNewMessage(p => p + emo)} className="hover:bg-gray-200 p-1 text-xl">{emo}</button>)}</div>}
                            <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }} className="text-gray-500 hover:text-gray-700" disabled={!canEdit}><Smile size={20} /></button>
                            <input className="flex-1 px-2 py-1 border border-gray-400 text-sm" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={canEdit ? "Message..." : "Log in to chat..."} disabled={!canEdit} />
                            <BevelButton onClick={sendMessage} disabled={!canEdit || !newMessage.trim()}>Send</BevelButton>
                        </div>
                    </div>
                </Window>

                <Window title="Storage Manager" isOpen={openWindows.storage} onClose={() => toggleWindow('storage')} width="w-72" height="h-64">
                    <div className="flex flex-col items-center justify-center h-full gap-4 bg-white p-4">
                        <div className="text-sm font-bold text-gray-700">Server Usage (90% Cap)</div>
                        <div className={`w-24 h-24 rounded-full border-4 border-gray-300 flex items-center justify-center text-xl font-bold text-white shadow-xl transition-colors duration-500 ${percentUsed > 90 ? 'bg-red-500' : percentUsed > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}>{Math.round(percentUsed)}%</div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden border border-gray-400"><div className={`h-full ${percentUsed > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${percentUsed}%`}}></div></div>
                        <div className="text-xs text-gray-500 flex justify-between w-full font-mono"><span>Used: {formatBytes(totalUsed)}</span><span>Free: {formatBytes(availableBytes)}</span></div>
                    </div>
                </Window>

                <Window title="Broadcast" isOpen={openWindows.announce} onClose={() => toggleWindow('announce')} height="h-48">
                    <div className="flex flex-col h-full gap-2 p-2 bg-white"><div className="text-xs text-gray-500">Send a system-wide alert to all users.</div><textarea className="flex-1 border border-gray-400 p-2 text-sm resize-none" value={announceText} onChange={e => setAnnounceText(e.target.value)} placeholder="Type announcement..." disabled={!canEdit}></textarea><div className="flex justify-end"><BevelButton onClick={postAnnouncement} disabled={!announceText || !canEdit}>Broadcast</BevelButton></div></div>
                </Window>

                <div className="h-10 bg-gray-300 border-t-2 border-white flex items-center px-2 gap-2 fixed bottom-0 w-full z-[150] shadow-md">
                    <BevelButton onClick={handleAutoArrange} className="font-bold italic flex gap-1 items-center px-3"><LayoutGrid size={16}/> Auto Arrange</BevelButton>
                    <div className="border-l border-gray-400 h-6 mx-1"></div>
                    <div className="flex-1 flex gap-1">{apps.map(app => (<BevelButton key={app.id} onClick={() => toggleWindow(app.id)} onDoubleClick={() => toggleWindow(app.id)} className={`flex items-center gap-2 min-w-[100px] justify-start ${openWindows[app.id] ? 'bg-gray-200 border-t-black border-l-black border-r-white border-b-white border-dotted' : ''}`}><app.Icon size={14}/> {app.name}</BevelButton>))}</div>
                    <div className="ml-auto flex items-center gap-2"><div className="text-xs border-2 border-gray-500 px-2 py-1 bg-gray-200 inset-shadow flex items-center gap-2">{currentUser ? <><User size={12}/> {currentUser.name}</> : 'Not Logged In'}</div>{currentUser && <button onClick={() => setCurrentUser(null)} className="p-1 hover:bg-red-500 hover:text-white rounded"><LogOut size={14}/></button>}<div className="text-xs border-2 border-gray-500 px-2 py-1 bg-gray-200 inset-shadow">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div>
                </div>
            </>
        )}
    </div>
  );
}