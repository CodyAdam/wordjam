"use client";
import Image from "next/image";
import backgroundImage from "../../public/login-background.png";
import jamIcon from "../../public/jam.png";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { SOCKET_URL } from "@/lib/config";

enum Type {
  Nickname,
  Token,
}

type Inputs = {
  nicknameOrToken: string;
};

export default function Login() {
  const { readyState } =
    useWebSocket(SOCKET_URL, {share: true});



  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = data => {

  };
  const [loginType, setLoginType] = useState(Type.Nickname);


  return (
    <div className="flex items-center justify-center h-full flex-col">
      <Image className="-z-10 blur-sm object-cover" fill src={backgroundImage} alt="background"></Image>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 rounded-lg shadow gap-4 flex flex-col">
        <div className="flex">
          <h1 className="font-bold text-5xl text-gray-700">WordJam</h1>
          <Image className="animate-wiggle" height={40} src={jamIcon} alt="jam"></Image>
        </div>

        <p className="text-gray-500">A multiplayer word game</p>


        {readyState !== ReadyState.OPEN && (
          <div className="flex flex-col justify-center items-center gap-4">

            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h1 className="font-bold text-2xl text-gray-700">Connecting to server...</h1>

          </div>
        )}
        {readyState === ReadyState.OPEN && (
          <>
            {loginType === Type.Nickname && (
              <>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  placeholder="Nickname"
                  {...register("nicknameOrToken", {required: true})}
                />
                {errors.nicknameOrToken && <span className="text-red-500">This field is required</span>}
              </>

            )}
            {loginType === Type.Token && (
              <>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  placeholder="Token"
                  {...register("nicknameOrToken", {required: true})}
                />
                {errors.nicknameOrToken && <span className="text-red-500">This field is required</span>}
              </>
            )}


            <button
              className="w-full bg-green-400 p-2 rounded-md text-white font-bold text-xl hover:bg-green-500 transition-colors">Play
            </button>
            {loginType === Type.Nickname && (
              <button onClick={() => setLoginType(Type.Token)} className="text-gray-400">Already playing on another device
                ?</button>)}
            {loginType === Type.Token && (
              <button onClick={() => setLoginType(Type.Nickname)} className="text-gray-400">New player ?</button>)}
          </>
        )}



      </form>
      <a className="opacity-50" href="https://www.flaticon.com/free-icons/jam" title="jam icons">Jam icons created by
        Adib Sulthon - Flaticon</a>
    </div>
  );
}
