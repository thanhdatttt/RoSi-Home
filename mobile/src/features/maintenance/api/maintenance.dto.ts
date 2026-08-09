export type MaintenanceStatusDto = 'Pending' | 'InProgress' | 'Completed';
export type MaintenancePriorityDto = 'Low' | 'Medium' | 'High' | 'Urgent';

export type MaintenanceRequestDto = {
  id: string;
  title: string;
  description: string;
  roomId?: string;
  room?: { id: string; name: string };
  status: MaintenanceStatusDto;
  priority?: MaintenancePriorityDto;
  submittedAt: string;
  photos?: {
    id: string;
    url?: string;
    fileUrl?: string;
    fileName?: string;
  }[];
  statusHistory?: {
    toStatus: MaintenanceStatusDto;
    changedAt: string;
  }[];
};
