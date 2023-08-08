import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Id, Task, TaskCardProps } from "../types";
import TrashIcon from "../icons/TrashIcon";

function TaskCard({ task, deleteTask, updateTask }: TaskCardProps) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Helper functions
  
  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  // Event handlers

  const handleKeyDown = (e) => {
    if (e.shiftKey && e.key === "Enter") {
      toggleEditMode();
    }
  };

  const handleTextChange = (e) => {
    const newTextValue = e.target.value;
    updateTask(task.id, newTextValue)
  };

  const handleMouseEnter = (e) => {
    setMouseIsOver(true)
  };

  const handleMouseLeave = (e) => {
    setMouseIsOver(false)
  };

  // Render logic
  // When dragging, we want to show a placeholder element instead of the actual task card
  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="opacity-30 bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-rose-500 cursor-grab relative"/>
    );
  }

  // When in edit mode, we want to show a textarea instead of the actual text on the task card
  if (editMode) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative">
        <textarea
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
          value={task.content}
          autoFocus
          placeholder="Add the task content here..."
          onBlur={toggleEditMode}
          onKeyDown={handleKeyDown}
          onChange={handleTextChange}
        />
      </div>
    );
  }

  // When not dragging and not in edit mode, we want to show the actual task card
  if (!isDragging && !editMode) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task" onClick={toggleEditMode} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
          {task.content}
        </p>
        
        {/* Delete button: We only want to show the delete button when the mouse is over the task card */
        mouseIsOver && (
          <button onClick={() => deleteTask(task.id)} className="absolute p-2 -translate-y-1/2 rounded stroke-white right-4 top-1/2 bg-columnBackgroundColor opacity-60 hover:opacity-100">
            <TrashIcon />
          </button>
        )}

      </div>
    );
  }
}

export default TaskCard;
