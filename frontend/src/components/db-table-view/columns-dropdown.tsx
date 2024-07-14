import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column, Table } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export function ColumnsDropdown<T>({
  table,
  columnOrder,
  setColumnOrder,
}: {
  table: Table<T>;
  columnOrder: string[];
  setColumnOrder: Dispatch<SetStateAction<string[]>>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columnOrder}
            strategy={verticalListSortingStrategy}
          >
            {columnOrder.map((columnId) => {
              const column = table.getColumn(columnId);
              if (!column) return null;
              return <SortableItem key={column.id} column={column} />;
            })}
          </SortableContext>
        </DndContext>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setColumnOrder((items) => {
        const oldIndex = items.findIndex((id) => id === active.id);
        const newIndex = items.findIndex((id) => id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}

const SortableItem = ({ column }: { column: Column<any> }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <DropdownMenuCheckboxItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      key={column.id}
      onSelect={(e) => e.preventDefault()}
      checked={column.getIsVisible()}
      onCheckedChange={column.toggleVisibility}
    >
      <div className="flex items-center gap-2 justify-between w-full">
        {column.id}
        <button ref={setActivatorNodeRef} {...listeners} className={"shrink-0"}>
          <GripVertical />
        </button>
      </div>
    </DropdownMenuCheckboxItem>
  );
};
