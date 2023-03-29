'use client';
import Image from 'next/image';
import jamIcon from '../../public/jam.png';
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from 'react-hook-form';
import { Socket } from "socket.io-client";
import { AppState } from "@/src/lib/AppState";

enum Type {
  Nickname,
  Token,
}

type Inputs = {
  nicknameOrToken: string;
};

export default function Login({ isConnected, socket, onLogin }: { isConnected: boolean, socket: Socket, onLogin: (token: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    socket.emit('login', JSON.stringify({ data: {username: data.nicknameOrToken} }))
  };

  const [loginType, setLoginType] = useState(Type.Nickname);



  useEffect(() => {


    const tokenEvent = (data: any) => {
      const dataParsed = JSON.parse(data);

      if (dataParsed.status && dataParsed.status === "ALREADY_EXIST") {
        alert("Nickname already exist, please choose another one");
        return;
      }
      if (dataParsed.status && dataParsed.status === "SUCCESS") {
        onLogin(dataParsed.token);
      }
    };
    socket.on('token', tokenEvent);


    const onConnect = () => {
      const token = localStorage.getItem("token");
      if (token) {
        socket.emit('login', JSON.stringify({ token: token }))
      }
    };
    socket.on('connect', onConnect);



    return () => {
      socket.off('token',tokenEvent)
      socket.off('connect', onConnect);
    }

  }, [socket]);



  return (
    <div className='flex h-full flex-col items-center justify-center absolute backdrop-blur-sm bg-black/20'>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3 rounded-lg bg-white p-10 shadow'>
        <div className='flex'>
          <h1 className='pr-2 text-5xl font-bold text-gray-700'>WordJam</h1>
          <Image className='animate-wiggle' height={40} src={jamIcon} alt='jam'></Image>
        </div>
        <p className='text-gray-300 -mt-3'>A multiplayer word game</p>
        <div className='mt-4'></div>
        {!isConnected ? (
          <div className='flex flex-col items-center justify-center gap-4 pt-6'>
            <svg
              className='-ml-1 mr-3 h-10 w-10 animate-spin text-red-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            <h1 className='text-2xl font-bold text-gray-700'>Connecting to server...</h1>
          </div>
        ) : (
          <>
            {loginType === Type.Nickname && (
              <>
                <input
                  className='focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'
                  type='text'
                  placeholder='Nickname'
                  {...register('nicknameOrToken', { required: true })}
                />
                {errors.nicknameOrToken && <span className='text-red-500'>This field is required</span>}
              </>
            )}
            {loginType === Type.Token && (
              <>
                <input
                  className='focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'
                  type='text'
                  placeholder='Token'
                  {...register('nicknameOrToken', { required: true })}
                />
                {errors.nicknameOrToken && <span className='text-red-500'>This field is required</span>}
              </>
            )}

            <button className='w-full rounded-md bg-green-400 p-2 text-xl font-bold text-white transition-colors hover:bg-green-500'>
              Play
            </button>
            {loginType === Type.Nickname && (
              <button
                onClick={() => {
                  setLoginType(Type.Token);
                  resetField('nicknameOrToken');
                }}
                className='text-gray-400'
              >
                Already playing on another device ?
              </button>
            )}
            {loginType === Type.Token && (
              <button
                onClick={() => {
                  setLoginType(Type.Nickname);
                  resetField('nicknameOrToken');
                }}
                className='text-gray-400'
              >
                New player ?
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
}
