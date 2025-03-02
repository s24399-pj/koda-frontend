import { useEffect } from "react";

const useTitle = (title: unknown) => {
    useEffect(() => {
        const prefix = "Koda | ";
        document.title = `${prefix}${title}`;
    }, [title]);
};

export default useTitle;
