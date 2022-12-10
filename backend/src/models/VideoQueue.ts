import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

enum convertStatus {
  Never = '0',
  Convert = '1',
  Converting = '2',
  Converted = '3',
  Error = '4',
}

@Entity({
  name: 'video_queue',
})
export default class VideoQueue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({
    name: 'chunk_id',
  })
  chunkId: string;

  @Column({
    name: 'session_id',
  })
  sessionId: string;

  @Column({
    default: null,
    name: 'file_name',
  })
  fileName: string;

  @Column({
    default: 'pending',
  })
  status: 'done' | 'error' | 'processing' | 'pending' | 'added';

  @Column({
    default: null,
    type: 'json',
  })
  error: JSON;

  @Column({
    default: false,
  })
  notified: boolean;

  @Column({
    default: 0,
  })
  tried: number;

  @Column({
    default: true,
    name: 'check_res',
  })
  checkRes: boolean;

  @Column({
    name: 'video_location',
  })
  videoLocation: string;

  @Column({
    default: false,
    name: 'is_social_video',
  })
  isSocialVideo: boolean;

  @Column({
    default: null,
    name: 'social_url',
  })
  socialURL: string | null;

  @Column({
    default: 0,
  })
  duration: string; // In seconds

  @Column({
    default: 0,
  })
  size: number;

  @Column({
    default: convertStatus.Never,
    name: 'mp3',
  })
  mp3: convertStatus;

  @Column({
    default: convertStatus.Never,
    name: '240p',
  })
  res240: convertStatus;

  @Column({
    default: convertStatus.Never,
    name: '360p',
  })
  res360: convertStatus;

  @Column({
    default: convertStatus.Never,
    name: '480p',
  })
  res480: convertStatus;

  @Column({
    default: convertStatus.Never,
    name: '720p',
  })
  res720: convertStatus;

  @Column({
    default: convertStatus.Never,
    name: '1080p',
  })
  res1080: convertStatus;

  @Column({
    default: convertStatus.Never,
    name: '2048p',
  })
  res2048: convertStatus;

  @Column({
    default: convertStatus.Never,
    name: '4096p',
  })
  res4096: convertStatus;

  @Column({
    type: 'json',
    nullable: true,
  })
  thumbnails: string[] | null;

  @Column({
    default: null,
  })
  gif: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'convert_start_time',
    default: null,
  })
  convertStartTime: number | null;

  @Column({
    name: 'convert_end_time',
    default: null,
  })
  convertEndTime: number | null;

  @Column({
    default: 0,
    name: 'convert_status',
    nullable: true,
  })
  convertStatus: number | null;
}
