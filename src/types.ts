export type ItemStatus = 'applying' | 'reading' | 'solving' | 'idle';
export type ItemType = 'book' | 'course' | 'gem' | 'skill' | 'prompt';

export interface KnowledgeItem {
  id: string;
  title: string;
  type: ItemType;
  status: ItemStatus;
  tags: string[];
  isToday: boolean;
  isSkill: boolean;
  content?: string;
  createdAt: number;
  parentId?: string;
  isGroup?: boolean;
}

export const STATUS_CONFIG = {
  applying: { label: '應用', color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
  reading: { label: '在讀', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  solving: { label: '解題', color: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' },
  idle: { label: '閒置', color: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-400' },
};

export const TYPE_CONFIG = {
  book: { label: '書籍', icon: '📖' },
  course: { label: '課程', icon: '🎓' },
  gem: { label: 'GEM', icon: '✨' },
  skill: { label: '技能', icon: '🛠️' },
  prompt: { label: 'Prompt', icon: '🤖' },
};
