// Import NPM packages
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

// Import components, data, hooks, and types from other files
import { ColumnContainer } from "./ColumnContainer";
import { TaskCard } from "./TaskCard";
import { PlusIcon } from "../icons";
import { Column, Id, Task } from "../types";
import { defaultColumnsData, defaultTasksData } from "../data";

// Import the default columns and tasks from the data file
const defaultCols: Column[] = defaultColumnsData;
const defaultTasks: Task[] = defaultTasksData;

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }) );

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
        <div className="flex gap-4 m-auto">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer key={col.id} column={col} tasks={tasks.filter((task) => task.columnId === col.id)} deleteColumn={deleteColumn} updateColumn={updateColumn} createTask={createTask} deleteTask={deleteTask} updateTask={updateTask} />
              ))}
            </SortableContext>
          </div>
          <button onClick={() => createNewColumn()} className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2">
            <PlusIcon />
            <span>Add Column</span>
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer column={activeColumn} tasks={tasks.filter((task) => task.columnId === activeColumn.id)} deleteColumn={deleteColumn} updateColumn={updateColumn} createTask={createTask} deleteTask={deleteTask} updateTask={updateTask} />
            )}
            {activeTask && (
              <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />
            )}
          </DragOverlay>,
          document.body
        )}

      </DndContext>
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: Id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  }

  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    // Get the active item (the item that is being dragged)
    const { active } = event;

    // If the active item (the item that is being dragged) is a column, set the active column state
    if (active.data.current?.type === "Column") {
      setActiveColumn(active.data.current.column as Column);
      return;
    }

    // If the active item (the item that is being dragged) is a task, set the active task state
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task as Task);
      return;
    }
  }


  function onDragOver(event: DragOverEvent) {
    // Get the active item (the item that is being dragged) and the over item (the item that it is being dragged over)
    const { active, over } = event;

    // If there is no over item (the item that the active item is being dragged over) is not present, do nothing
    if (!over) return;

    // If both the active item (the item that is being dragged) as well as the over item (the item that it is being dragged over) have the same ID, there has been no position change, so do nothing
    if (active.id === over.id) return;

    // Check the type of both the active item (the item that is being dragged) as wemll as the over item (the item that it is being dragged over)
    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    // If the active item (the item that is being dragged) is not a task, do nothing
    if (!isActiveATask) return;

    // If the active item (the item that is being dragged) and the over item (the item that it is being dragged over) are both tasks, use the over 
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        // Find the index of the active task (the task that is being dragged) by finding the index of the task with the same ID as the active task
        const activeIndex = tasks.findIndex((task) => task.id === active.id);
        // Find the index of the over task (the task that it is being dragged over) by finding the index of the task with the same ID as the over task
        const overIndex = tasks.findIndex((task) => task.id === over.id);
        // Update the column ID of the active task to the column ID of the over task
        tasks[activeIndex].columnId = tasks[overIndex].columnId;
        // Move the active task to the index of the over task
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // If the active item (the item that is being dragged) is a task and the over item (the item that it is being dragged over) is a column, ... 
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        // Find the index of the active task (the task that is being dragged) by finding the index of the task with the same ID as the active task
        const activeIndex = tasks.findIndex((task) => task.id === active.id);
        // Update the column ID of the active task to the column ID of the over column (the column that it is being dragged over)
        tasks[activeIndex].columnId = over.id;
        // Move the active task to the same index as it was before (actually, the task is not moved, but it is removed from its current position and re-inserted at the same position which forces a re-render)
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  function onDragEnd(event: DragEndEvent) {
    // When the drag ends, reset the active column and task
    setActiveColumn(null);
    setActiveTask(null);

    // Get the active item (the item that is being dragged) and the over item (the item that it is being dragged over)
    const { active, over } = event;

    // If there is no over item (the item that the active item is being dragged over) is not present, do nothing
    if (!over) return;

    // If both the active item (the item that is being dragged) as well as the over item (the item that it is being dragged over) have the same ID, there has been no position change, so do nothing
    if (active.id === over.id) return;
  
    setColumns((columns) => {
      // Find the index of the active column (the column that is being dragged) by finding the column with the same ID as the active item (the item that is being dragged)
      const activeColumnIndex = columns.findIndex((column) => column.id === active.id);

      // Find the index of the over column (the column that is being dragged over) by finding the column with the same ID as the over item (the item that it is being dragged over)
      const overColumnIndex = columns.findIndex((column) => column.id === over.id);

      // Move the active column (the column that is being dragged) to the index of the over column (the column that is being dragged over)
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
