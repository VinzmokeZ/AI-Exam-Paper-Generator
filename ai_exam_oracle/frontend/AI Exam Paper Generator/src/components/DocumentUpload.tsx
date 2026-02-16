import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';

interface DocumentUploadProps {
    subjectId: string;
    subjectName: string;
    topicId?: string;
    topicName?: string;
    onClose: () => void;
    onSuccess?: () => void;
    isOpen: boolean;
}

export function DocumentUpload({ subjectId, subjectName, topicId, topicName, onClose, onSuccess, isOpen }: DocumentUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const acceptedFormats = ['.pdf', '.doc', '.docx', '.txt', '.pptx'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > maxFileSize) {
            toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
            return;
        }

        setSelectedFile(file);
        setUploadStatus('idle');
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setUploadStatus('uploading');

        try {
            // Simulate progression
            for (let i = 0; i <= 100; i += 20) {
                setUploadProgress(i);
                await new Promise(r => setTimeout(r, 200));
            }
            setUploadStatus('success');
            toast.success("Document uploaded!");
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 1000);
        } catch (error) {
            setUploadStatus('error');
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Upload Asset"
            subtitle={topicName ? `${subjectName} > ${topicName}` : subjectName}
        >
            <div className="space-y-6">
                {!selectedFile ? (
                    <div className="block">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept={acceptedFormats.join(',')}
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-4 border-dashed border-[#E5DED6] rounded-[32px] p-10 text-center cursor-pointer hover:border-[#C5B3E6]/30 hover:bg-white transition-all group"
                        >
                            <div className="w-16 h-16 bg-[#F5F1ED] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-[#8B9E9E]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#0A1F1F] mb-1">Click to browse assets</h3>
                            <p className="text-[10px] text-[#8B9E9E] font-bold uppercase tracking-widest">PDF • DOCX • MAX 10MB</p>
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-[24px] p-4 border border-[#E5DED6] flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#F5F1ED] rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-[#8B9E9E]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#0A1F1F] truncate">{selectedFile.name}</p>
                                <p className="text-[10px] font-bold text-[#8B9E9E]">{(selectedFile.size / 1024 / 1024).toFixed(1)}MB</p>
                            </div>
                            {uploadStatus === 'idle' && (
                                <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {uploadStatus === 'uploading' && (
                            <div className="px-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-[#8B9E9E] uppercase tracking-widest">Uploading...</span>
                                    <span className="text-[10px] font-bold text-[#0A1F1F]">{uploadProgress}%</span>
                                </div>
                                <div className="h-2 bg-[#F5F1ED] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        className="h-full bg-gradient-to-r from-[#C5B3E6] to-[#8BE9FD]"
                                    />
                                </div>
                            </div>
                        )}

                        {uploadStatus === 'success' && (
                            <div className="flex items-center gap-2 text-green-500 font-bold text-xs px-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Perfect! Asset received.</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-[#C5B3E6]/5 rounded-2xl p-4 border border-[#C5B3E6]/10 flex gap-3">
                    <Info className="w-4 h-4 text-[#C5B3E6] flex-shrink-0" />
                    <p className="text-[10px] font-medium text-[#8B9E9E] leading-relaxed">
                        Assets are indexed by our neural engine to provide context-aware question generation for your exams.
                    </p>
                </div>

                <div className="pt-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading || uploadStatus === 'success'}
                        className="w-full bg-[#0A1F1F] text-white rounded-[24px] py-5 font-bold text-base shadow-xl flex items-center justify-center gap-3 disabled:opacity-30 transition-all"
                    >
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-5 h-5 opacity-70" strokeWidth={3} />
                                <span>Inject Asset</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </Modal>
    );
}
