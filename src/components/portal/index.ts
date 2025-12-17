// Portal components index
export { QuickActions, QuickActionButton, defaultQuickActions, teamLeaderQuickActions, hrAdminQuickActions } from "./QuickActions";
export type { QuickActionItem } from "./QuickActions";
export {
  StatsWidget,
  ListWidget,
  NotificationWidget,
  ChartWidget,
  WidgetContainer,
  DashboardGrid,
} from "./Widget";

// Navigation components
export { FavoritesMenu } from "./FavoritesMenu";
export type { FavoriteMenuItem } from "./FavoritesMenu";
export { RecentWork, addRecentWork } from "./RecentWork";
export type { RecentWorkItem } from "./RecentWork";

// Dashboard components
export { DraggableWidget, WidgetGrid, useWidgetLayout, AddWidgetButton } from "./DraggableWidget";
export type { WidgetConfig } from "./DraggableWidget";
export { RoleDashboard } from "./RoleDashboard";

