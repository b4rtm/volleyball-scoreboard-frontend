import { useEffect, useState } from "react"

const MainTimer = () => {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, [])
    
    return (
        <div>
            <h2 className="text-2xl text-center mb-4">
                Current Date:
                <br/>
                {currentTime.toLocaleTimeString()} {currentTime.getFullYear()}-{(currentTime.getMonth() + 1).toString().padStart(2, '0')}-{currentTime.getDate().toString().padStart(2, '0')}
            </h2>
        </div>
    )
}

export default MainTimer;
