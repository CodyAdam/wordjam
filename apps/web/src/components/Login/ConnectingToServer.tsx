import Modal from "@/src/components/Login/LoginModal";
import LoginHeader from "@/src/components/Login/Header";
import SvgSpinnersBlocksShuffle3 from "@/src/components/svg/SvgSpinnersBlocksShuffle3";

export default function ConnectingToServer() {
    return <Modal onSubmit={() => {}} handleSubmit={() => {}}>
        <LoginHeader>
            Almost there!
        </LoginHeader>

        <div className="flex animate-pulse flex-col items-center justify-center gap-4 pt-6 text-gray-700">
            <h1 className="text-lg font-semibold ">Connecting to the server...</h1>
            <SvgSpinnersBlocksShuffle3 className="h-10 w-10"/>
        </div>
    </Modal>;
}
