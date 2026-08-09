import {
  MaintenancePriority,
  MaintenanceRequest,
  MaintenanceStatus,
} from '../models/maintenance';
import {
  MaintenancePriorityDto,
  MaintenanceRequestDto,
  MaintenanceStatusDto,
} from './maintenance.dto';

const statusMap: Record<MaintenanceStatusDto, MaintenanceStatus> = {
  Pending: 'Mới',
  InProgress: 'Đang xử lý',
  Completed: 'Hoàn tất',
};

const priorityMap: Record<MaintenancePriorityDto, MaintenancePriority> = {
  Low: 'Thấp',
  Medium: 'Trung bình',
  High: 'Cao',
  Urgent: 'Khẩn cấp',
};

export function toMaintenanceRequest(
  dto: MaintenanceRequestDto,
): MaintenanceRequest {
  return {
    id: dto.id,
    roomId: dto.roomId ?? dto.room?.id ?? '',
    roomName: dto.room?.name,
    title: dto.title,
    description: dto.description,
    createdAt: dto.submittedAt,
    status: statusMap[dto.status],
    priority: dto.priority ? priorityMap[dto.priority] : undefined,
    photos: dto.photos
      ?.map((photo) => ({
        id: photo.id,
        url: photo.url ?? photo.fileUrl ?? '',
        name: photo.fileName,
      }))
      .filter((photo) => Boolean(photo.url)),
    statusHistory: dto.statusHistory?.map((entry) => ({
      status: statusMap[entry.toStatus],
      changedAt: entry.changedAt,
    })),
  };
}
