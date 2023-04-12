'use client';

import { useState } from 'react';
import { InventoryLetter } from '../types/board';
import { LetterButton } from './Letter';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { boardFont } from '@/src/utils/fontLoader';
import { letterToPoints } from '../utils/letterPoints';

export default function UserUI({
  inventory,
  onPlace,
  onReset,
  onSubmit,
  onReplace,
}: {
  inventory: InventoryLetter[];
  onPlace: (index: number) => void;
  onReset: () => void;
  onSubmit: () => void;
  onReplace: (index: number, newIndex: number) => void;
}) {
  function ondragend(result: any) {
    if (!result.destination) {
      return;
    }
    onReplace(result.source.index, result.destination.index);
  }

  return (
    <>
      <DragDropContext onDragEnd={ondragend}>
        <Droppable droppableId='droppable' direction='horizontal'>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className='h-30  absolute left-[35%] bottom-6 flex w-fit  flex-wrap justify-center gap-3'
            >
              {inventory.map((letter, i) => (
                <Draggable key={letter.letter} draggableId={letter.letter} index={i}>
                  {(provided, snapshot) => (
                    <div
                      onClick={() => {
                        if (letter.position == undefined) {
                          onPlace(i);
                        }
                      }}
                      style={provided.draggableProps.style}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group cursor-pointer select-none disabled:opacity-30 ${
                        snapshot.isDragging || letter.position != undefined ? 'opacity-50' : ' '
                      }`}
                    >
                      <div className='flex h-20 w-20 items-center justify-center rounded-lg bg-slate-200 pb-8 text-6xl font-bold text-zinc-700 shadow-sm transition-all duration-75 group-hover:-translate-y-4 group-hover:scale-105 group-hover:shadow-lg'>
                        <div className='relative flex h-20 w-20 items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-1'>
                          <span className={boardFont.className}>{letter.letter.toUpperCase()}</span>
                          <div className='absolute top-0 right-1 text-sm'>{letterToPoints[letter.letter.toUpperCase()]}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className='absolute right-10 bottom-10 flex flex-col items-end gap-5'>
        <button
          className='flex h-20 w-fit items-center justify-center rounded-lg bg-red-100 p-7 pb-8 text-5xl font-bold text-red-700 transition-all duration-75 hover:-translate-y-4 hover:scale-105 hover:shadow-lg'
          onClick={onReset}
        >
          Reset
        </button>
        <button
          className='flex h-20 w-fit items-center justify-center rounded-lg bg-blue-100 p-7 pb-8 text-5xl font-bold text-blue-700 transition-all duration-75 hover:-translate-y-4 hover:scale-105 hover:shadow-lg'
          onClick={onSubmit}
        >
          Submit
        </button>
      </div>
    </>
  );
}
