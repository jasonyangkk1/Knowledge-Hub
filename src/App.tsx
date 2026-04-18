import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  ChevronDown,
  Archive, 
  Star, 
  Clock,
  LayoutGrid,
  Library,
  Zap,
  MoreHorizontal,
  Folder,
  FolderOpen,
  Copy,
  CopyPlus
} from 'lucide-react';
import { KnowledgeItem, ItemStatus, ItemType, STATUS_CONFIG, TYPE_CONFIG } from './types';

// Initial Data
const INITIAL_DATA: KnowledgeItem[] = [
  { 
    id: 'group-1', 
    title: '寄 mail 出去', 
    type: 'skill', 
    status: 'applying', 
    tags: ['#工作', '#自動化'], 
    isToday: true, 
    isSkill: true,
    isGroup: true,
    createdAt: Date.now() 
  },
  { 
    id: '1', 
    title: 'Claud mail skill', 
    type: 'skill', 
    status: 'applying', 
    tags: ['#工作'], 
    isToday: true, 
    isSkill: true,
    parentId: 'group-1',
    createdAt: Date.now() 
  },
  { 
    id: '2', 
    title: 'Reference Claude', 
    type: 'book', 
    status: 'solving', 
    tags: [], 
    isToday: true, 
    isSkill: true,
    parentId: 'group-1',
    createdAt: Date.now() - 10000 
  },
  { 
    id: '3', 
    title: '輸出 mail 驗證', 
    type: 'skill', 
    status: 'applying', 
    tags: ['#工作'], 
    isToday: true, 
    isSkill: true,
    parentId: 'group-1',
    createdAt: Date.now() - 20000 
  },
  { 
    id: '4', 
    title: '洞察模塊', 
    type: 'gem', 
    status: 'reading', 
    tags: ['#思考'], 
    isToday: true, 
    isSkill: false,
    createdAt: Date.now() - 30000 
  },
  { 
    id: '5', 
    title: '窮查理的普通常識', 
    type: 'book', 
    status: 'idle', 
    tags: ['#思維模型'], 
    isToday: false, 
    isSkill: true,
    createdAt: Date.now() - 40000 
  }
];

export default function App() {
  const [items, setItems] = useState<KnowledgeItem[]>(() => {
    const saved = localStorage.getItem('kh-data');
    if (!saved) return INITIAL_DATA;
    
    try {
      const parsed = JSON.parse(saved) as KnowledgeItem[];
      // Data Migration: Convert legacy types to current valid types
      return parsed.map(item => {
        if ((item.type as string) === 'mail') return { ...item, type: 'skill' as ItemType };
        if ((item.type as string) === 'insight') return { ...item, type: 'gem' as ItemType };
        return item;
      });
    } catch (e) {
      console.error('Failed to parse saved data', e);
      return INITIAL_DATA;
    }
  });
  const [activeTab, setActiveTab] = useState<'today' | 'library' | 'skills'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'book' as ItemType,
    status: 'idle' as ItemStatus,
    tags: '',
    isGroup: false,
    parentId: ''
  });

  useEffect(() => {
    localStorage.setItem('kh-data', JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [items, searchQuery]);

  const todayItems = useMemo(() => items.filter(i => i.isToday && !i.isSkill && !i.parentId), [items]);
  const libraryItems = useMemo(() => items.filter(i => !i.isSkill && !i.isToday && !i.parentId), [items]);
  const skillItems = useMemo(() => items.filter(i => i.isSkill && !i.parentId), [items]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({ title: '', type: 'book', status: 'idle', tags: '', isGroup: false, parentId: '' });
    setIsModalOpen(true);
  };

  const handleEditItem = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      status: item.status,
      tags: item.tags.join(' '),
      isGroup: !!item.isGroup,
      parentId: item.parentId || ''
    });
    setIsModalOpen(true);
  };

  const saveItem = () => {
    if (!formData.title) return;

    const tags = formData.tags.split(' ').filter(t => t.startsWith('#'));
    
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? {
        ...i,
        title: formData.title,
        type: formData.type,
        status: formData.status,
        tags,
        isGroup: formData.isGroup,
        parentId: formData.parentId || undefined
      } : i));
    } else {
      const newItem: KnowledgeItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        type: formData.type,
        status: formData.status,
        tags,
        isToday: activeTab === 'today',
        isSkill: activeTab === 'skills' || formData.isGroup,
        isGroup: formData.isGroup,
        parentId: formData.parentId || undefined,
        createdAt: Date.now()
      };
      setItems([newItem, ...items]);
    }
    setIsModalOpen(false);
  };

  const toggleToday = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isToday: !i.isToday } : i));
  };

  const moveToSkills = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isSkill: true, isToday: false } : i));
  };

  const restoreFromSkills = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isSkill: false } : i));
  };

  const copyItemToToday = (item: KnowledgeItem) => {
    const newItem: KnowledgeItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      isToday: true,
      isSkill: false,
      createdAt: Date.now()
    };
    if (item.isGroup) {
      const children = items.filter(i => i.parentId === item.id);
      const newChildren = children.map(child => ({
        ...child,
        id: Math.random().toString(36).substr(2, 9),
        parentId: newItem.id,
        isToday: true,
        isSkill: false,
        createdAt: Date.now()
      }));
      setItems([...items, newItem, ...newChildren]);
    } else {
      setItems([newItem, ...items]);
    }
  };

  const copyItemToLibrary = (item: KnowledgeItem) => {
    const newItem: KnowledgeItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      isToday: false,
      isSkill: false,
      createdAt: Date.now()
    };
    if (item.isGroup) {
      const children = items.filter(i => i.parentId === item.id);
      const newChildren = children.map(child => ({
        ...child,
        id: Math.random().toString(36).substr(2, 9),
        parentId: newItem.id,
        isToday: false,
        isSkill: false,
        createdAt: Date.now()
      }));
      setItems([...items, newItem, ...newChildren]);
    } else {
      setItems([newItem, ...items]);
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Knowledge Hub</h1>
            <p className="text-xs text-gray-500 font-medium">個人知識管理系統</p>
          </div>
          <button 
            onClick={handleAddItem}
            className="p-2 bg-black text-white rounded-full hover:scale-105 transition-transform active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-[73px] z-20 bg-white border-b border-gray-200 px-6">
        <div className="max-w-2xl mx-auto flex">
          {(['today', 'library', 'skills'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'today' && '今日挑選'}
              {tab === 'library' && '知識庫'}
              {tab === 'skills' && '技能庫'}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">今日專注</h2>
                <span className="text-[10px] text-gray-400">點擊卡片切換狀態 • 左右滑動排序</span>
              </div>

              {todayItems.length > 0 ? (
                <Reorder.Group 
                  axis="y" 
                  values={todayItems} 
                  onReorder={(newOrder) => {
                    const otherItems = items.filter(i => !i.isToday || i.isSkill);
                    setItems([...newOrder, ...otherItems]);
                  }}
                  className="space-y-4"
                >
                  {todayItems.map((item) => (
                    <TodayCard 
                      key={item.id} 
                      item={item} 
                      onEdit={() => handleEditItem(item)}
                      onArchive={() => moveToSkills(item.id)}
                      onRemove={() => toggleToday(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onCopyToLibrary={() => copyItemToLibrary(item)}
                      onEditChild={handleEditItem}
                      onDeleteChild={deleteItem}
                      allItems={items}
                    />
                  ))}
                </Reorder.Group>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                  <p className="text-gray-400 text-sm">今日尚無專注項目</p>
                  <button 
                    onClick={() => setActiveTab('library')}
                    className="mt-4 text-xs font-bold text-blue-600 hover:underline"
                  >
                    從知識庫中挑選
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="搜尋知識、標籤..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard label="總計項目" value={items.length} icon={<LayoutGrid size={16}/>} />
                <StatCard label="在讀/應用" value={items.filter(i => i.status === 'reading' || i.status === 'applying').length} icon={<Zap size={16}/>} />
              </div>

              <div className="space-y-3">
                {libraryItems.map((item) => (
                  <LibraryCard 
                    key={item.id} 
                    item={item} 
                    onEdit={() => handleEditItem(item)}
                    onToggleToday={() => toggleToday(item.id)}
                    onArchive={() => moveToSkills(item.id)}
                    onCopyToToday={() => copyItemToToday(item)}
                    onCopyToLibrary={() => copyItemToLibrary(item)}
                    onDelete={() => deleteItem(item.id)}
                    onEditChild={handleEditItem}
                    onDeleteChild={deleteItem}
                    allItems={items}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-black text-white p-6 rounded-3xl mb-8">
                <h2 className="text-lg font-bold mb-1">技能庫</h2>
                <p className="text-xs text-white/60">這裡儲存了你已內化或暫時閒置的技能模塊。</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {skillItems.length > 0 ? skillItems.map((item) => (
                  <SkillCard 
                    key={item.id} 
                    item={item} 
                    onEdit={() => handleEditItem(item)}
                    onRestore={() => restoreFromSkills(item.id)}
                    onDelete={() => deleteItem(item.id)}
                    onCopyToLibrary={() => copyItemToLibrary(item)}
                    onEditChild={handleEditItem}
                    onDeleteChild={deleteItem}
                    allItems={items}
                  />
                )) : (
                  <div className="py-20 text-center text-gray-400 text-sm">
                    尚無技能儲存
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 sm:hidden" />
              <h3 className="text-xl font-bold mb-6">{editingItem ? '編輯項目' : '新增知識項目'}</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">名稱</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="輸入名稱..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-black transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">類型</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as ItemType})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    >
                      {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">狀態</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as ItemStatus})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">標籤 (空格分隔，需含 #)</label>
                  <input 
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                    placeholder="#工作 #學習..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox"
                        checked={formData.isGroup}
                        onChange={e => setFormData({...formData, isGroup: e.target.checked})}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${formData.isGroup ? 'bg-black' : 'bg-gray-200'}`} />
                      <div className={`absolute left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isGroup ? 'translate-x-4' : ''}`} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">設為技能組合 (抽屜功能)</span>
                  </label>

                  {!formData.isGroup && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">歸屬組合 (放入抽屜)</label>
                      <select 
                        value={formData.parentId}
                        onChange={e => setFormData({...formData, parentId: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                      >
                        <option value="">無 (獨立項目)</option>
                        {items.filter(i => i.isGroup && i.id !== editingItem?.id).map(group => (
                          <option key={group.id} value={group.id}>📁 {group.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={saveItem}
                    className="flex-[2] py-4 text-sm font-bold bg-black text-white rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    儲存項目
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper for child items
function ChildItemCard({ child, onEdit, onDelete }: { 
  child: KnowledgeItem, 
  onEdit: (i: KnowledgeItem) => void, 
  onDelete: (id: string) => void,
  key?: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm group/child">
      <span className="text-xl">{TYPE_CONFIG[child.type]?.icon || '📦'}</span>
      <span className="text-xs font-bold flex-1 truncate">{child.title}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(child); }}
          className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
          title="編輯"
        >
          <Edit2 size={12} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(child.id); }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="刪除"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${STATUS_CONFIG[child.status]?.color}`}>
        {STATUS_CONFIG[child.status]?.label}
      </span>
    </div>
  );
}

// Sub-components
function TodayCard({ item, onEdit, onArchive, onRemove, onDelete, onEditChild, onDeleteChild, onCopyToLibrary, allItems }: { 
  item: KnowledgeItem, 
  onEdit: () => void, 
  onArchive: () => void,
  onRemove: () => void,
  onDelete: () => void,
  onEditChild: (i: KnowledgeItem) => void,
  onDeleteChild: (id: string) => void,
  onCopyToLibrary: () => void,
  allItems: KnowledgeItem[],
  key?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.idle;
  const type = TYPE_CONFIG[item.type] || TYPE_CONFIG.book;
  const children = allItems.filter(i => i.parentId === item.id);

  return (
    <Reorder.Item 
      value={item}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="group relative bg-white border border-gray-200 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="p-6">
        <div className="flex gap-5">
          <div className={`w-1.5 rounded-full ${status.dot}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => item.isGroup && setIsExpanded(!isExpanded)}>
                <span className="text-2xl">{item.isGroup ? (isExpanded ? <FolderOpen size={24} className="text-blue-500" /> : <Folder size={24} className="text-blue-500" />) : type.icon}</span>
                <h3 className="font-bold text-base tracking-tight truncate flex items-center gap-2">
                  {item.title}
                  {item.isGroup && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">
                      {children.length} 模塊
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {item.isGroup && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 text-gray-400 hover:text-black transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
                <button 
                  onClick={onEdit}
                  className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-full transition-all"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={onArchive}
                  className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                  title="存入技能庫"
                >
                  <Archive size={14} />
                </button>
                <button 
                  onClick={onRemove}
                  className="p-2 text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all"
                  title="從今日移除"
                >
                  <Star size={14} fill="none" />
                </button>
                <button 
                  onClick={onCopyToLibrary}
                  className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
                  title="複製到知識庫"
                >
                  <CopyPlus size={14} />
                </button>
                <button 
                  onClick={onDelete}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="刪除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                {status.label}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.isGroup ? '技能組合' : type.label}</span>
              {item.tags.map(tag => (
                <span key={tag} className="text-[10px] text-gray-400 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && item.isGroup && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50/50 border-t border-gray-100"
          >
            <div className="p-4 space-y-2">
              {children.map(child => (
                <ChildItemCard 
                  key={child.id} 
                  child={child} 
                  onEdit={onEditChild} 
                  onDelete={onDeleteChild} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

function LibraryCard({ item, onEdit, onToggleToday, onArchive, onCopyToToday, onCopyToLibrary, onDelete, onEditChild, onDeleteChild, allItems }: { 
  item: KnowledgeItem, 
  onEdit: () => void,
  onToggleToday: () => void,
  onArchive: () => void,
  onCopyToToday: () => void,
  onCopyToLibrary: () => void,
  onDelete: () => void,
  onEditChild: (i: KnowledgeItem) => void,
  onDeleteChild: (id: string) => void,
  allItems: KnowledgeItem[],
  key?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.idle;
  const type = TYPE_CONFIG[item.type] || TYPE_CONFIG.book;
  const children = allItems.filter(i => i.parentId === item.id);

  return (
    <div className="bg-white border border-gray-100 rounded-[28px] overflow-hidden hover:border-gray-200 transition-all group shadow-sm">
      <div className="p-4 flex items-center gap-4">
        <div className={`w-1 h-8 rounded-full ${status.dot}`} />
        <div className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer" onClick={() => item.isGroup && setIsExpanded(!isExpanded)}>
          <span className="text-xl">
            {item.isGroup ? (isExpanded ? <FolderOpen size={20} className="text-blue-500" /> : <Folder size={20} className="text-blue-500" />) : type.icon}
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-bold truncate flex items-center gap-2">
              {item.title}
              {item.isGroup && (
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">
                  {children.length}
                </span>
              )}
            </h4>
            <div className="flex gap-2 mt-0.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.isGroup ? '技能組合' : type.label}</span>
              <span className="text-[10px] text-gray-400">•</span>
              <span className="text-[10px] text-gray-400">{status.label}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {item.isGroup && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-black transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <button 
            onClick={onCopyToToday}
            className="flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded-xl text-[10px] font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="複製到今日專注"
          >
            <Copy size={12} />
          </button>
          <button 
            onClick={onCopyToLibrary}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="複製到知識庫副本"
          >
            <CopyPlus size={12} />
          </button>
          <div className="w-[1px] h-4 bg-gray-100 mx-1" />
          <button 
            onClick={onToggleToday}
            className={`p-2 rounded-lg transition-colors ${item.isToday ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'}`}
            title="切換今日狀態"
          >
            <Star size={14} fill={item.isToday ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={onArchive}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="存入技能庫"
          >
            <Archive size={14} />
          </button>
          <button 
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
            title="編輯"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="刪除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && item.isGroup && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50/50 border-t border-gray-100"
          >
            <div className="p-4 space-y-2">
              {children.length > 0 ? children.map(child => (
                <ChildItemCard 
                  key={child.id} 
                  child={child} 
                  onEdit={onEditChild} 
                  onDelete={onDeleteChild} 
                />
              )) : (
                <div className="text-center py-4 text-[10px] text-gray-400 italic">空抽屜</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillCard({ item, onEdit, onRestore, onDelete, onCopyToLibrary, onEditChild, onDeleteChild, allItems }: { 
  item: KnowledgeItem, 
  onEdit: () => void,
  onRestore: () => void,
  onDelete: () => void,
  onCopyToLibrary: () => void,
  onEditChild: (i: KnowledgeItem) => void,
  onDeleteChild: (id: string) => void,
  allItems: KnowledgeItem[],
  key?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const type = TYPE_CONFIG[item.type] || TYPE_CONFIG.skill;
  const children = allItems.filter(i => i.parentId === item.id);
  
  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden transition-all">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => item.isGroup && setIsExpanded(!isExpanded)}>
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">
            {item.isGroup ? (isExpanded ? <FolderOpen size={20} className="text-blue-500" /> : <Folder size={20} className="text-blue-500" />) : type.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              {item.title}
              {item.isGroup && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">
                  {children.length} 模塊
                </span>
              )}
            </h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">
              {item.isGroup ? '技能組合' : type.label} • 已內化技能
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {item.isGroup && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-black transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <button 
            onClick={onEdit}
            className="p-1.5 text-gray-300 hover:text-black transition-colors"
            title="編輯"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={onCopyToLibrary}
            className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors"
            title="複製到知識庫副本"
          >
            <CopyPlus size={14} />
          </button>
          <button 
            onClick={onRestore}
            className="px-3 py-1.5 text-[10px] font-bold bg-gray-100 hover:bg-black hover:text-white rounded-lg transition-all"
            title="恢復到今日/知識庫"
          >
            恢復
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && item.isGroup && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50/50 border-t border-gray-100"
          >
            <div className="p-4 space-y-2">
              {children.map(child => (
                <ChildItemCard 
                  key={child.id} 
                  child={child} 
                  onEdit={onEditChild} 
                  onDelete={onDeleteChild} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 p-4 rounded-2xl">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
