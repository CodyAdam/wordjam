export default function Modal(
    {handleSubmit, onSubmit, children}: { handleSubmit: any, onSubmit: any, children: any }
) {
    return <div className='flex h-full w-full flex-col items-center justify-center'>
        <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-3 rounded-2xl border-b-8 border-gray-200 bg-white p-10 shadow-xl'
        >
            {children}
        </form>
    </div>
}
