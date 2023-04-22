'use client';

import { useMemo, useState } from 'react';
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
  onAskLetter,
  cooldown,
}: {
  inventory: InventoryLetter[];
  onPlace: (index: number) => void;
  onReset: () => void;
  onSubmit: () => void;
  onReplace: (index: number, newIndex: number) => void;
  onAskLetter: () => void;
  cooldown: number;
}) {
  function ondragend(result: any) {
    if (!result.destination) {
      return;
    }
    onReplace(result.source.index, result.destination.index);
  }

  const isPlacedLetter = useMemo(() => {
    // if all positions of the letter in the inventory is not null, return true
    return inventory.map((letter) => letter.position).every((pos) => !pos);
  }, [inventory]);

  return (
    <>
      <div className='absolute bottom-0 flex flex-col flex-wrap gap-6 p-4'>
        <div className='flex w-full gap-4'>
          <button
            disabled={cooldown > 0}
            className='group flex w-fit items-center justify-center '
            onClick={onAskLetter}
          >
            <div className='rounded-lg border-b-4 border-orange-400 bg-orange-100 px-4 py-2 text-2xl font-bold text-orange-700 transition-all duration-75 group-hover:group-enabled:-translate-y-2 group-hover:group-enabled:scale-105 group-hover:group-enabled:shadow-lg group-disabled:cursor-not-allowed group-disabled:border-gray-500 group-disabled:bg-gray-300 group-disabled:text-gray-700 group-disabled:opacity-40'>
              {cooldown > 0 ? (
                `${cooldown}s`
              ) : (
                <>
                  <span className='hidden md:block'>New letter</span>
                  <span className='md:hidden'>Letter</span>
                </>
              )}
            </div>
          </button>
          <div className='m-auto'></div>
          {!isPlacedLetter && (
            <button className='group flex w-fit items-center justify-center' onClick={onReset}>
              <div className='rounded-lg border-b-4 border-red-400 bg-red-100 px-4 py-2 text-2xl font-bold text-red-700 transition-all duration-75 disabled:bg-gray-300 disabled:text-gray-700 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-lg'>
                Reset
              </div>
            </button>
          )}
          <button className='group flex w-fit items-center justify-center' onClick={onSubmit}>
            <div className='rounded-lg border-b-4 border-blue-400 bg-blue-100 px-4 py-2 text-2xl font-bold text-blue-700 transition-all duration-75 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-lg'>
              Submit
            </div>
          </button>
        </div>

        <DragDropContext onDragEnd={ondragend}>
          <Droppable droppableId='droppable' direction='horizontal'>
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className='flex w-fit flex-wrap gap-3'>
                {inventory.map((letter, i) => (
                  <Draggable key={i.toString()} draggableId={i.toString()} index={i}>
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
                            <div className='absolute top-0 right-1 text-sm'>
                              {letterToPoints[letter.letter.toUpperCase()]}
                            </div>
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
      </div>
    </>
  );
}
