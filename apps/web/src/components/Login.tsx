'use client';
import Image from 'next/image';
import jamIcon from '../../public/jam.png';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Socket } from 'socket.io-client';
import { LoginResponseType } from '../types/api';
import MaterialSymbolsFramePersonSharp from './svg/MaterialSymbolsFramePersonSharp';
import SvgSpinnersBlocksShuffle3 from './svg/SvgSpinnersBlocksShuffle3';

enum Type {
  Nickname,
  Token,
}

type Inputs = {
  nicknameOrToken: string;
};

const HEADER = (
  <>
    <div className='flex gap-3'>
      <h1 className='pr-2 text-5xl font-bold text-gray-700'>WordJam</h1>
      <Image className='animate-wiggle' height={40} width={40} src={jamIcon} alt='jam'></Image>
    </div>
    <p className='-mt-3 text-gray-300'>A multiplayer word game</p>
    <div className='mt-4'></div>
  </>
);

export default function Login({ isConnected, socket }: { isConnected: boolean; socket: Socket }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (loginType === Type.Nickname) {
      const username = data.nicknameOrToken;
      socket.emit('onRegister', username);
    } else {
      const token = data.nicknameOrToken;
      socket.emit('onLogin', token.toUpperCase());
    }
  };

  const [loginType, setLoginType] = useState(Type.Nickname);

  if (!isConnected)
    return (
      <div className='absolute flex h-full w-full flex-col items-center justify-center bg-black/20 backdrop-blur-sm'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col gap-3 rounded-2xl border-b-8 border-gray-200 bg-white p-10 shadow-xl'
        >
          {HEADER}
          <div className='flex flex-col items-center justify-center gap-4 pt-6 text-gray-700 animate-pulse'>
            <h1 className='text-lg font-semibold '>Connecting to the server...</h1>
            <SvgSpinnersBlocksShuffle3 className='w-10 h-10' />
          </div>
        </form>
      </div>
    );

  if (loginType === Type.Nickname)
    return (
      <div className='absolute flex h-full w-full flex-col items-center justify-center bg-black/20 backdrop-blur-sm'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col gap-3 rounded-2xl border-b-8 border-gray-200 bg-white p-10 shadow-xl'
        >
          {HEADER}
          <input
            className='focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 focus:outline-none'
            type='text'
            placeholder='Nickname'
            {...register('nicknameOrToken', { required: true })}
          />
          {errors.nicknameOrToken && <span className='-mt-3 text-xs text-red-500'>You need a nickname to play!</span>}
          <button className='w-full rounded-lg border-b-4 border-green-400 bg-green-200 p-2 text-xl font-bold text-green-900 transition-colors hover:border-green-500 hover:bg-green-300'>
            Let&apos;s Jam!
          </button>
          <button
            onClick={() => {
              setLoginType(Type.Token);
              resetField('nicknameOrToken');
            }}
            className='text-sm text-gray-400 hover:text-gray-600'
          >
            Already playing on another device?
          </button>
        </form>
      </div>
    );

  return (
    <div className='absolute flex h-full w-full flex-col items-center justify-center bg-black/20 backdrop-blur-sm'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col gap-3 rounded-2xl border-b-8 border-gray-200 bg-white p-10 shadow-xl'
      >
        {HEADER}
        <input
          className='focus:shadow-outline w-full appearance-none rounded border py-2 px-3 uppercase leading-tight text-gray-700 focus:outline-none'
          type='text'
          placeholder='YOUR LOGIN CODE'
          {...register('nicknameOrToken', { required: true })}
        />
        {errors.nicknameOrToken && <span className='-mt-3 text-xs text-red-500'>Where is your login code?</span>}
        <button className='w-full rounded-lg border-b-4 border-blue-400 bg-blue-200 p-2 text-xl font-bold text-blue-900 transition-colors hover:bg-blue-300 flex items-center gap-3 justify-center'>
          <MaterialSymbolsFramePersonSharp className='h-6 w-6'></MaterialSymbolsFramePersonSharp>
          Login
        </button>
        <button
          onClick={() => {
            setLoginType(Type.Nickname);
            resetField('nicknameOrToken');
          }}
          className='text-sm text-gray-400 hover:text-gray-600'
        >
          New player?
        </button>
      </form>
    </div>
  );
}
