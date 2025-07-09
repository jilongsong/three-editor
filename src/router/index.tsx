import { Routes, Route, Navigate } from "react-router-dom"
import Editor from "@/pages/editor"

export default function AppRouter(){
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/editor" />} />
            <Route path="editor" element={<Editor />} />
        </Routes>
    )
}