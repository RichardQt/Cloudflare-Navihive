import { Group, Site } from './API/http';

// 确保GroupWithSites的id字段必定存在
export interface GroupWithSites extends Omit<Group, 'id'> {
  id: number; // 确保id始终存在
  sites: Site[];
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
