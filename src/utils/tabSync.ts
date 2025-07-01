
interface TabSyncMessage {
  type: 'MACHINES_UPDATED' | 'POOLS_UPDATED' | 'CACHE_CLEAR' | 'LOADING_STATE';
  data?: any;
  timestamp: number;
  tabId: string;
}

class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private listeners: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('machine-management');
      this.channel.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  private handleMessage(event: MessageEvent<TabSyncMessage>) {
    const { type, data, tabId } = event.data;
    
    // Ignore messages from the same tab
    if (tabId === this.tabId) return;
    
    const listener = this.listeners.get(type);
    if (listener) {
      listener(data);
    }
  }

  broadcast(type: TabSyncMessage['type'], data?: any) {
    if (!this.channel) return;
    
    const message: TabSyncMessage = {
      type,
      data,
      timestamp: Date.now(),
      tabId: this.tabId
    };
    
    this.channel.postMessage(message);
  }

  subscribe(type: string, callback: (data: any) => void) {
    this.listeners.set(type, callback);
  }

  unsubscribe(type: string) {
    this.listeners.delete(type);
  }

  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }

  getTabId() {
    return this.tabId;
  }
}

export const tabSyncManager = new TabSyncManager();
