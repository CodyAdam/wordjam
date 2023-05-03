'use client';

import { useCallback, useMemo, useState } from 'react';
import { InventoryLetter } from '../types/board';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { boardFont } from '@/src/utils/fontLoader';
import { letterToPoints } from '../utils/letterPoints';
import { Player } from '../types/api';
import LoginCredModal from './LoginCredModal';
import LoginCredButton from './LoginCredButton';
import { getUsername } from '../utils/user';
import IcOutlineChevronRight from './svg/IcOutlineChevronRight';
import MaterialSymbolsCenterFocusWeakOutlineSharp from './svg/MaterialSymbolsCenterFocusWeakOutlineSharp';

export default function UserUI({
  inventory,
  scores,
  onPlace,
  onReset,
  onLogout,
  onSubmit,
  onReplace,
  onLetterButton,
  onCenter,
  cooldown,
}: {
  inventory: InventoryLetter[];
  scores: Player[];
  onPlace: (index: number) => void;
  onReset: () => void;
  onSubmit: () => void;
  onLogout: () => void;
  onCenter: () => void;
  onReplace: (index: number, newIndex: number) => void;
  onLetterButton: () => void;
  cooldown: number;
}) {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [expandLeaderboard, setExpandLeaderboard] = useState(false);
  const onDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) {
        return;
      }
      onReplace(result.source.index, result.destination.index);
    },
    [onReplace],
  );
  const isPlacedLetter = useMemo(() => {
    // if all positions of the letter in the inventory is not null, return true
    return inventory.map((letter) => letter.position).every((pos) => !pos);
  }, [inventory]);

  return (
    <>
      <div className='absolute top-3 flex flex-col font-mono text-xl font-bold justify-center items-center pointer-events-none select-none'>
        <h1>BETA VERSION</h1>
        <h2 className='text-sm font-normal'>Ending the 10th of May, 8pm CEST</h2>
      </div>
      <button className='group absolute top-0 left-0 m-4 flex w-fit items-center justify-center ' onClick={onCenter}>
        <div className='flex items-center gap-2 rounded-lg border-b-4 border-orange-400 bg-orange-100 px-4 py-2 text-xl font-bold text-orange-700  transition-all duration-75 group-hover:group-enabled:bg-orange-200 group-disabled:cursor-not-allowed group-disabled:border-gray-500 group-disabled:bg-gray-300 group-disabled:text-gray-700 group-disabled:opacity-40 md:text-2xl'>
          <MaterialSymbolsCenterFocusWeakOutlineSharp className='h-6 w-6 md:h-8 md:w-8' />
          <span className='hidden md:block'>Center Focus</span>
        </div>
      </button>
      {showTokenModal && <LoginCredModal onClick={() => setShowTokenModal(false)} onLogout={onLogout} />}
      <div className='absolute top-0 right-0 m-4 flex flex-col gap-4'>
        <LoginCredButton onClick={() => setShowTokenModal(true)}></LoginCredButton>
        <div className='flex flex-col gap-3 rounded-md border-b-4 border-gray-300 bg-white p-2 text-slate-800 md:p-4 '>
          <button onClick={() => setExpandLeaderboard(!expandLeaderboard)} className='flex items-center gap-1 md:gap-3'>
            <IcOutlineChevronRight
              className={`h-6 w-6 transform transition-transform md:h-8 md:w-8 ${expandLeaderboard ? 'rotate-90' : ''}`}
            />
            <h1 className='text-base font-bold md:text-2xl'>Leaderboard</h1>
          </button>
          {expandLeaderboard && (
            <div className='max-h-40 overflow-y-auto px-2 text-sm md:max-h-80 md:text-base'>
              <table className='w-full table-auto border-t'>
                <thead>
                  <tr className='text-md h-10 text-slate-700 md:text-lg'>
                    <th className='pl-2 text-start'></th>
                    <th className='text-start'>Username</th>
                    <th className='pr-2 text-end'>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((player, i) => {
                    const username = getUsername();
                    if (username === player.username)
                      return (
                        <tr className='h-10  text-blue-800' key={i}>
                          <td className='rounded-l-md bg-blue-50 pr-4 pl-2 text-center font-bold'>{i + 1}</td>
                          <td
                            className='max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap bg-blue-50 text-start'
                            title={player.username}
                          >
                            <span className='opacity-50'>(You)</span> {player.username}
                          </td>
                          <td className='rounded-r-md bg-blue-50 pr-2 text-end'>{player.score}</td>
                        </tr>
                      );
                    return (
                      <tr className='' key={i}>
                        <td className='h-5 pr-4 pl-2 text-center font-bold'>{i + 1}</td>
                        <td
                          className='max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap text-start'
                          title={player.username}
                        >
                          {player.username}
                        </td>
                        <td className='pr-2 text-end'>{player.score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className='absolute bottom-0 flex flex-col flex-wrap gap-6 p-4'>
        <div className='flex w-full gap-4'>
          <button
            disabled={cooldown > 0}
            className='group flex w-fit items-center justify-center '
            onClick={onLetterButton}
          >
            <div className='rounded-lg border-b-4 border-orange-400 bg-orange-100 px-4 py-2 text-xl font-bold text-orange-700 transition-all duration-75 group-hover:group-enabled:-translate-y-2 group-hover:group-enabled:scale-105 group-hover:group-enabled:shadow-lg group-disabled:cursor-not-allowed group-disabled:border-gray-500 group-disabled:bg-gray-300 group-disabled:text-gray-700 group-disabled:opacity-40 md:text-2xl'>
              {cooldown > 0 ? `${cooldown}s` : 'Reroll'}
            </div>
          </button>

          <div className='m-auto'></div>
          {!isPlacedLetter && (
            <button className='group flex w-fit items-center justify-center' onClick={onReset}>
              <div className='rounded-lg border-b-4 border-red-400 bg-red-100 px-4 py-2 text-xl font-bold text-red-700 transition-all duration-75 disabled:bg-gray-300 disabled:text-gray-700 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-lg md:text-2xl'>
                Clear
              </div>
            </button>
          )}
          <button className='group flex w-fit items-center justify-center' onClick={onSubmit}>
            <div className='rounded-lg border-b-4 border-blue-400 bg-blue-100 px-4 py-2 text-xl font-bold text-blue-700 transition-all duration-75 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-lg md:text-2xl'>
              Submit
            </div>
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
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
                        <div className='flex h-14 w-14 items-center justify-center rounded-lg bg-slate-200 pb-4 text-4xl font-bold text-zinc-700 shadow-sm transition-all duration-75 group-hover:-translate-y-4 group-hover:scale-105 group-hover:shadow-lg md:h-20 md:w-20 md:pb-8 md:text-6xl'>
                          <div className='relative flex h-14 w-14 items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-1 md:h-20 md:w-20'>
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
