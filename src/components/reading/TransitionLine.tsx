interface Props {
  text: string;
}

export default function TransitionLine({ text }: Props) {
  return (
    <div className="py-8 px-4 text-center">
      <p className="font-cormorant italic text-[18px] sm:text-[21px] text-bone-dim leading-[1.4] max-w-md mx-auto">
        {text}
      </p>
    </div>
  );
}
