'use client';
import React, { useRef } from 'react';
import Icon from '@/components/ui/Icon';

interface DraggableDashboardCardProps {
  id: string;
  index: number;
  isDragging: boolean;
  isOver: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  showHandle?: boolean;
}

export default function DraggableDashboardCard({
  id,
  index,
  isDragging,
  isOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  children,
  style,
  className = '',
  showHandle = true,
}: DraggableDashboardCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    // Check if user clicked an interactive target (link, button, input)
    const target = e.target as HTMLElement;
    if (target.closest('a, button, input, select, textarea, [data-no-drag="true"]')) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(id, e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(id);
  };

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      className={`ss-drag-card ${isDragging ? 'ss-drag-card-dragging' : ''} ${isOver ? 'ss-drag-card-over' : ''} ${className}`}
      style={{
        ...style,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      data-card-id={id}
      data-card-index={index}
    >
      <div className="ss-drag-card-inner" style={{ position: 'relative' }}>
        {showHandle && (
          <div
            className="ss-drag-handle"
            title="Drag to rearrange"
            aria-label="Drag to rearrange"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
            }}
          >
            <Icon name="grip" size={14} color="#8A9099" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
