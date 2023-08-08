// Import NPM packages
import { useMemo, useState } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Import components, data, hooks, and types from other files
import { TaskCard } from "./TaskCard";
import { ColumnContainerProps } from "../types";
import { PlusIcon, TrashIcon } from "../icons";

export function ColumnContainer({ column, deleteColumn, updateColumn, tasks, createTask, deleteTask, updateTask }: ColumnContainerProps) {
  const [editMode, setEditMode] = useState(false);
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  
  // + Event handlers +
  
  const handleTextChange = (e: { target: { value: string; }; }) => {
    updateColumn(column.id, e.target.value)
  };

  const handleClick = () => {
    setEditMode(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return; 
    setEditMode(false);
  }

  const handleBlur = () => {
    setEditMode(false);
  }

  // + Render logic +

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="bg-columnBackgroundColor opacity-40 border-2 border-pink-500 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col" />
    );
  }

  if (!isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col">
        {/* Column title */}
        <div {...attributes} {...listeners} onClick={handleClick} className="bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="flex items-center justify-center px-2 py-1 text-sm rounded-full bg-columnBackgroundColor">0</div>
            {!editMode ? column.title : <input className="px-2 bg-black border rounded outline-none focus:border-rose-500" value={column.title} onChange={handleTextChange} autoFocus onBlur={handleBlur} onKeyDown={handleKeyDown}/>}
          </div>
          <button onClick={() => { deleteColumn(column.id) }} className="px-1 py-2 rounded stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor">
            <TrashIcon />
          </button>
        </div>

        {/* Column task container */}
        <div className="flex flex-col flex-grow gap-4 p-2 overflow-x-hidden overflow-y-auto">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask}/>)}
          </SortableContext>
        </div>

        {/* Column footer */}
        <button onClick={() => createTask(column.id)} className="flex items-center gap-2 p-4 border-2 rounded-md border-columnBackgroundColor border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black">
          <PlusIcon />
          <span>Add task</span>
        </button>
      </div>
    )
  }
} 

export default ColumnContainer;
