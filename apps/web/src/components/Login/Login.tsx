'use client';
import {useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {Socket} from 'socket.io-client';
import MaterialSymbolsFramePersonSharp from '../svg/MaterialSymbolsFramePersonSharp';
import {setUsername} from '../../utils/user';
import Modal from "@/src/components/Login/LoginModal";
import LoginHeader from "@/src/components/Login/Header";
import ConnectingToServer from "@/src/components/Login/ConnectingToServer";

enum Type {
    Nickname,
    Token,
}

type Inputs = {
    nicknameOrToken: string;
};

export default function Login({isConnected, socket}: { isConnected: boolean; socket: Socket }) {
    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        resetField,
    } = useForm<Inputs>({});
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        if (loginType === Type.Nickname) {
            const username = data.nicknameOrToken;
            setUsername(username);
            socket.emit('onRegister', username);
        } else {
            const token = data.nicknameOrToken;
            socket.emit('onLogin', token.toUpperCase());
        }
    };

    const [loginType, setLoginType] = useState(Type.Nickname);

    if (!isConnected)
        return (
            <ConnectingToServer/>
        );

    if (loginType === Type.Nickname)
        return (
            <Modal onSubmit={onSubmit} handleSubmit={handleSubmit}>
                <LoginHeader>
                    Ready to have fun?
                </LoginHeader>


                <input
                    className='focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 focus:outline-none'
                    maxLength={20}
                    type='text'
                    placeholder='Nickname'
                    {...register('nicknameOrToken', {required: true})}
                    onChange={(e) => {
                        setValue('nicknameOrToken', e.target.value.trim());
                    }}
                />
                {errors.nicknameOrToken &&
                    <span className='-mt-3 text-xs text-red-500'>You need a nickname to play!</span>}
                <button
                    className='w-full rounded-lg border-b-4 border-green-400 bg-green-200 p-2 text-xl font-bold text-green-900 transition-colors hover:border-green-500 hover:bg-green-300'>
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
            </Modal>

        );

    return (
        <Modal onSubmit={onSubmit} handleSubmit={handleSubmit}>
            <LoginHeader>
                Welcome back!
            </LoginHeader>

                <input
                    className='focus:shadow-outline w-full appearance-none rounded border py-2 px-3 uppercase leading-tight text-gray-700 focus:outline-none'
                    type='text'
                    placeholder='YOUR LOGIN CODE'
                    {...register('nicknameOrToken', {required: true})}
                />
                {errors.nicknameOrToken &&
                    <span className='-mt-3 text-xs text-red-500'>Where is your login code?</span>}
                <button
                    className='flex w-full items-center justify-center gap-3 rounded-lg border-b-4 border-blue-400 bg-blue-200 p-2 text-xl font-bold text-blue-900 transition-colors hover:bg-blue-300'>
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
        </Modal>
    );
}
