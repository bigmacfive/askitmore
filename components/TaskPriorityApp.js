import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, X, Trash2 } from 'lucide-react';

const Button = ({ children, onClick, variant }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded flex items-center ${
      variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`}
  >
    {children}
  </button>
);

const Input = ({ value, onChange, onBlur, autoFocus }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    autoFocus={autoFocus}
    className="border border-gray-300 rounded px-2 py-1 w-full"
  />
);

const colors = [
  '#ffeb3b', '#ff9ff3', '#55efc4', '#74b9ff', '#a29bfe', 
  '#fab1a0', '#81ecec', '#ffeaa7', '#dfe6e9', '#00cec9'
];

const PostIt = ({ task, onDrag, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content);
  const [isDropping, setIsDropping] = useState(false);
  const postItRef = useRef(null);

  const handleDragStart = (e) => {
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('text/plain', JSON.stringify({ ...task, offsetX, offsetY }));
    if (e.target.releaseCapture) {
      e.target.releaseCapture();
    }
  };

  const handleEdit = () => {
    onEdit(task.id, content);
    setIsEditing(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = postItRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    postItRef.current.setAttribute('data-offset-x', offsetX);
    postItRef.current.setAttribute('data-offset-y', offsetY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const offsetX = parseInt(postItRef.current.getAttribute('data-offset-x'));
    const offsetY = parseInt(postItRef.current.getAttribute('data-offset-y'));
    onDrag({ clientX: touch.clientX - offsetX, clientY: touch.clientY - offsetY, preventDefault: () => {} }, task.id);
  };

  const handleContentClick = () => {
    if (content === '새 업무') {
      setContent('');
    }
    setIsEditing(true);
  };

  useEffect(() => {
    if (isDropping) {
      const timer = setTimeout(() => setIsDropping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isDropping]);

  return (
    <div
      ref={postItRef}
      className={`w-32 h-32 absolute cursor-move p-2 flex flex-col touch-none transition-all duration-300 ${isDropping ? 'scale-105 shadow-lg' : ''}`}
      style={{ 
        left: `${task.x}px`, 
        top: `${task.y}px`, 
        backgroundColor: task.color,
        boxShadow: isDropping ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
      }}
      draggable="true"
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTransitionEnd={() => setIsDropping(false)}
    >
      <button onClick={() => onDelete(task.id)} className="self-end">
        <X size={16} />
      </button>
      {isEditing ? (
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleEdit}
          autoFocus
        />
      ) : (
        <p onClick={handleContentClick} className="flex-1 overflow-auto text-sm">
          {content}
        </p>
      )}
    </div>
  );
};

const TaskPriorityApp = () => {
  const [tasks, setTasks] = useState([]);
  const canvasRef = useRef(null);

  const addTask = () => {
    const canvas = canvasRef.current.getBoundingClientRect();
    const postItWidth = 128;
    const postItHeight = 128;
    const maxX = canvas.width - postItWidth;
    const maxY = canvas.height - postItHeight;
    
    const newTask = {
      id: Date.now(),
      content: '새 업무',
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setTasks([...tasks, newTask]);
  };

  const handleDrag = (e, id) => {
    e.preventDefault();
    const canvas = canvasRef.current.getBoundingClientRect();
    const data = JSON.parse(e.dataTransfer.getData('text'));
    const x = Math.max(0, Math.min(e.clientX - canvas.left - data.offsetX, canvas.width - 128));
    const y = Math.max(0, Math.min(e.clientY - canvas.top - data.offsetY, canvas.height - 128));
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, x, y, isDropping: true } : task
    ));
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleEdit = (id, content) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, content } : task
    ));
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <div className="p-4 mx-auto" style={{ maxWidth: '740px' }}>
      <div className="flex gap-4 mb-4">
        <Button onClick={addTask}>
          <PlusCircle className="mr-2 h-4 w-4" /> <span>업무 추가</span>
        </Button>
        <Button onClick={clearAllTasks} variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" /> <span>전체 삭제</span>
        </Button>
      </div>
      <div 
        ref={canvasRef}
        className="relative w-full aspect-square border border-gray-300"
        style={{ maxWidth: '740px', maxHeight: '740px' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const data = JSON.parse(e.dataTransfer.getData('text'));
          handleDrag(e, data.id);
        }}
      >
        {/* X and Y axes */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 flex items-center justify-between px-2">
          <span className="text-sm">안 급함</span>
          <span className="text-sm">급함</span>
        </div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300 flex flex-col items-center justify-between py-2">
          <span className="text-sm">중요함</span>
          <span className="text-sm">덜 중요함</span>
        </div>
        
        {/* Quadrant labels */}
        <div className="absolute top-1 left-1 text-sm">중요하지만 급하지 않음</div>
        <div className="absolute top-1 right-1 text-sm text-right">급하고 중요함</div>
        <div className="absolute bottom-1 left-1 text-sm">급하지도 않고 덜 중요함</div>
        <div className="absolute bottom-1 right-1 text-sm text-right">급하지만 덜 중요함</div>

        {tasks.map(task => (
          <PostIt
            key={task.id}
            task={task}
            onDrag={handleDrag}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskPriorityApp;