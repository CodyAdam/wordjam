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

export default function UserUI({
  inventory,
  scores,
  onPlace,
  onReset,
  onLogout,
  onSubmit,
  onReplace,
  onAskLetter,
  cooldown,
}: {
  inventory: InventoryLetter[];
  scores: Player[];
  onPlace: (index: number) => void;
  onReset: () => void;
  onSubmit: () => void;
  onLogout: () => void;
  onReplace: (index: number, newIndex: number) => void;
  onAskLetter: () => void;
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
      {showTokenModal && <LoginCredModal onClick={() => setShowTokenModal(false)} onLogout={onLogout} />}
      <div className='absolute top-0 right-0 m-4 flex flex-col gap-4'>
        <LoginCredButton onClick={() => setShowTokenModal(true)}></LoginCredButton>
        <div className='flex flex-col gap-3 rounded-md border-b-4 border-gray-300 bg-white md:p-4 p-2 text-slate-800 '>
          <button onClick={() => setExpandLeaderboard(!expandLeaderboard)} className='flex items-center gap-1 md:gap-3'>
            <IcOutlineChevronRight
              className={`md:h-8 md:w-8 h-6 w-6 transform transition-transform ${expandLeaderboard ? 'rotate-90' : ''}`}
            />
            <h1 className='md:text-2xl text-base font-bold'>Leaderboard</h1>
          </button>
          {expandLeaderboard && (
            <div className='md:max-h-80 max-h-40 overflow-y-auto px-2 text-sm md:text-base'>
              <table className='table-auto border-t w-full'>
                <thead>
                  <tr className='h-10 md:text-lg text-md text-slate-700'>
                    <th className='text-start pl-2'></th>
                    <th className='text-start'>Username</th>
                    <th className='text-end pr-2'>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((player, i) => {
                    const username = getUsername();
                    if (username === player.username)
                      return (
                        <tr className='h-10  text-blue-800' key={i}>
                          <td className='pr-4 text-center font-bold bg-blue-50 rounded-l-md pl-2'>{i + 1}</td>
                          <td
                            className='max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap text-start bg-blue-50'
                            title={player.username}
                          >
                            <span className='opacity-50'>(You)</span> {player.username}
                          </td>
                          <td className='text-end bg-blue-50 rounded-r-md pr-2'>{player.score}</td>
                        </tr>
                      );
                    return (
                      <tr className='' key={i}>
                        <td className='h-5 pr-4 text-center font-bold pl-2'>{i + 1}</td>
                        <td
                          className='max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap text-start'
                          title={player.username}
                        >
                          {player.username}
                        </td>
                        <td className='text-end pr-2'>{player.score}</td>
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
            onClick={onAskLetter}
          >
            <div className='rounded-lg border-b-4 border-orange-400 bg-orange-100 px-4 py-2 md:text-2xl text-xl font-bold text-orange-700 transition-all duration-75 group-hover:group-enabled:-translate-y-2 group-hover:group-enabled:scale-105 group-hover:group-enabled:shadow-lg group-disabled:cursor-not-allowed group-disabled:border-gray-500 group-disabled:bg-gray-300 group-disabled:text-gray-700 group-disabled:opacity-40'>
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
              <div className='rounded-lg border-b-4 border-red-400 bg-red-100 px-4 py-2 md:text-2xl text-xl font-bold text-red-700 transition-all duration-75 disabled:bg-gray-300 disabled:text-gray-700 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-lg'>
                Clear
              </div>
            </button>
          )}
          <button className='group flex w-fit items-center justify-center' onClick={onSubmit}>
            <div className='rounded-lg border-b-4 border-blue-400 bg-blue-100 px-4 py-2 md:text-2xl text-xl font-bold text-blue-700 transition-all duration-75 group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-lg'>
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
                        <div className='flex md:h-20 h-14 md:w-20 w-14 items-center justify-center rounded-lg bg-slate-200 pb-4 md:pb-8 md:text-6xl text-4xl font-bold text-zinc-700 shadow-sm transition-all duration-75 group-hover:-translate-y-4 group-hover:scale-105 group-hover:shadow-lg'>
                          <div className='relative flex md:h-20 h-14 md:w-20 w-14 items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-1'>
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
