import { useNavigate } from "react-router-dom"
import { Undo } from "lucide-react"

export function Title(props: { text: string; undoPage?: string }) {
  const navigate = useNavigate();

  const handleUndoClick = () => {
    if (props.undoPage) {
      navigate(props.undoPage);
    }
  };

  return props.undoPage ? (
    <div className="flex flex-row gap-2 items-center  mb-16">
      <Undo className="w-8 h-8 cursor-pointer" onClick={handleUndoClick} />
      <h1 className="text-4xl font-semibold text-black font-['Poppins-SemiBold',Helvetica] tracking-[-0.60px]">
        {props.text}
      </h1>
    </div>
  ) : (
    <h1 className="text-4xl font-semibold text-black font-['Poppins-SemiBold',Helvetica] tracking-[-0.60px] mb-16">
      {props.text}
    </h1>
  );
}
