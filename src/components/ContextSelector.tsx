import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Link as LinkIcon, Loader2, Check, X, Database } from 'lucide-react';
import { toast } from 'sonner';

interface KnowledgeBase {
    id: number;
    title: string;
    source_type: string;
    is_processed: boolean;
}

interface ContextSelectorProps {
    onSelect: (kbId: number | null) => void;
    selectedId: number | null;
}

export function ContextSelector({ onSelect, selectedId }: ContextSelectorProps) {
    const [documents, setDocuments] = useState<KnowledgeBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: '', url: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/rag/documents');
            const data = await res.json();
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newDoc.title || !newDoc.url) return;
        setIsProcessing(true);
        try {
            const res = await fetch('http://localhost:8000/api/rag/process-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newDoc.title,
                    source_url: newDoc.url,
                    source_type: 'drive'
                })
            });
            if (res.ok) {
                toast.success("Document added and processing in background!");
                setNewDoc({ title: '', url: '' });
                setShowAdd(false);
                fetchDocuments();
            }
        } catch (error) {
            toast.error("Failed to add document");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#8B9E9E]" />
                    <h3 className="text-[10px] font-bold text-[#8B9E9E] uppercase tracking-widest">Knowledge Context</h3>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="p-1 hover:bg-[#F5F1ED] rounded-lg transition-colors text-[#C5B3E6]"
                >
                    <Plus className={`w-4 h-4 transition-transform ${showAdd ? 'rotate-45' : ''}`} />
                </button>
            </div>

            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[#F5F1ED] rounded-[24px] p-4 space-y-3 border border-[#E5DED6]">
                            <input
                                type="text"
                                placeholder="Document Title (e.g. Biology Ch 1)"
                                value={newDoc.title}
                                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                                className="w-full bg-white rounded-xl px-4 py-2 text-xs border border-[#E5DED6] focus:outline-none focus:border-[#C5B3E6]"
                            />
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8B9E9E]" />
                                <input
                                    type="text"
                                    placeholder="Google Drive Link"
                                    value={newDoc.url}
                                    onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                                    className="w-full bg-white rounded-xl pl-8 pr-4 py-2 text-xs border border-[#E5DED6] focus:outline-none focus:border-[#C5B3E6]"
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                disabled={isProcessing || !newDoc.title || !newDoc.url}
                                className="w-full bg-[#0A1F1F] text-white rounded-xl py-2 text-xs font-bold disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Inject Document'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-2">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 text-[#C5B3E6] animate-spin" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-4 bg-[#F5F1ED]/50 rounded-[24px] border border-dashed border-[#E5DED6]">
                        <p className="text-[10px] font-bold text-[#8B9E9E]">No context documents added yet</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <motion.button
                            key={doc.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onSelect(selectedId === doc.id ? null : doc.id)}
                            className={`flex items-center gap-3 p-3 rounded-[20px] text-left transition-all border-2 ${selectedId === doc.id
                                ? 'bg-gradient-to-r from-[#C5B3E6]/10 to-[#8BE9FD]/10 border-[#C5B3E6] shadow-sm'
                                : 'bg-white border-[#E5DED6] hover:border-[#C5B3E6]/30'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedId === doc.id ? 'bg-[#C5B3E6] text-white' : 'bg-[#F5F1ED] text-[#8B9E9E]'
                                }`}>
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#0A1F1F] truncate">{doc.title}</p>
                                <p className="text-[9px] font-bold text-[#8B9E9E] uppercase tracking-tighter">
                                    {doc.is_processed ? 'Ready for Context' : 'Indexing...'}
                                </p>
                            </div>
                            {selectedId === doc.id && (
                                <div className="w-5 h-5 bg-[#C5B3E6] rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </motion.button>
                    ))
                )}
            </div>
        </div>
    );
}
