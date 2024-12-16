interface Props {
    text: string;
}

export default function RoomCard({ text }: Props) {
    return (
        <div className="border-primary ">
            {text}
        </div>
    );
}
