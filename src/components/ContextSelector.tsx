import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Link as LinkIcon, Loader2, Check, X, Database, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api as axiosApi } from '../services/api';

interface KnowledgeBase {
    id: number;
    title: string;
    description?: string;
    source_url: string;
    source_type: string;
    is_processed: boolean;
    status: 'pending' | 'completed' | 'failed';
    error_message?: string;
    created_at: string;
}

interface ContextSelectorProps {
    onSelect: (kbId: number | null) => void;
    onInstantGenerate?: (kbId: number) => void;
    selectedId: number | null;
}

export function ContextSelector({ onSelect, onInstantGenerate, selectedId }: ContextSelectorProps) {
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
            const res = await axiosApi.get('/rag/documents');
            setDocuments(res.data);
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
            const res = await axiosApi.post('/rag/process-link', {
                title: newDoc.title,
                source_url: newDoc.url,
                source_type: 'drive'
            });
            if (res.status === 200 || res.status === 201) {
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

    const handleDelete = async (docId: number, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent triggering the parent button's onClick
        if (!window.confirm("Are you sure you want to delete this document?")) {
            return;
        }
        try {
            await axiosApi.delete(`/rag/documents/${docId}`);
            toast.success("Document deleted successfully!");
            fetchDocuments();
            if (selectedId === docId) {
                onSelect(null); // Deselect if the deleted document was selected
            }
        } catch (error) {
            console.error("Failed to delete document", error);
            toast.error("Failed to delete document");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1 pt-2">
                <div className="flex items-center gap-2 -ml-2"> {/* Moved slightly left as requested */}
                    <Database className="w-3.5 h-3.5 text-[#8B9E9E]" />
                    <h3 className="text-[10px] font-bold text-[#8B9E9E] uppercase tracking-[0.2em]">Knowledge Context</h3>
                </div>

                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F1ED] rounded-xl transition-all text-[#C5B3E6] active:scale-90"
                >
                    <Plus className={`w-4 h-4 transition-transform duration-300 ${showAdd ? 'rotate-45 text-[#FF6AC1]' : ''}`} />
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
                                className="w-full bg-white rounded-xl px-4 py-3 text-xs border border-[#E5DED6] focus:outline-none focus:border-[#C5B3E6] placeholder:text-[#8B9E9E]/50"
                            />
                            {/* Link Input - Redesigned for perfect alignment */}
                            <div className="flex items-center gap-3 w-full bg-white rounded-xl px-4 py-3 border border-[#E5DED6] focus-within:border-[#C5B3E6] shadow-sm transition-all group">
                                <LinkIcon className="w-3.5 h-3.5 text-[#8B9E9E]/60 group-focus-within:text-[#C5B3E6] transition-colors shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Paste link here..."
                                    value={newDoc.url}
                                    onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-[#8B9E9E]/40"
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
                                <p className={`text-[9px] font-bold uppercase tracking-tighter ${doc.status === 'failed' ? 'text-[#FF6AC1]' : 'text-[#8B9E9E]'
                                    }`}>
                                    {doc.status === 'failed' ? (doc.error_message || 'Processing Error') :
                                        doc.status === 'completed' ? 'Ready for Context' : 'Indexing Knowledge...'}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                {onInstantGenerate && doc.status === 'completed' && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onInstantGenerate(doc.id);
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#C5B3E6] hover:bg-[#C5B3E6]/10 transition-colors"
                                        title="Instant AI Generate"
                                    >
                                        <Sparkles className="w-4 h-4 fill-[#C5B3E6]/20" />
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => handleDelete(doc.id, e)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#FF6AC1]/40 hover:text-[#FF6AC1] hover:bg-[#FF6AC1]/10 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </motion.button>
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
