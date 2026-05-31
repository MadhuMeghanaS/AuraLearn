import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/apiService';
import { 
  Plus, 
  Files, 
  Trash2, 
  ChevronRight, 
  X, 
  Upload,
  Loader2,
  File
} from 'lucide-react';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsUploadOpen(false);
      setUploadTitle('');
      setUploadFile(null);
      fetchDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight">My Documents</h1>
          <p className="text-zinc-400 mt-1 font-semibold text-sm">Manage and organize your learning materials</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-[#ed7e99] hover:bg-[#eb6d8a] text-white px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center shadow-md shadow-[#ed7e99]/20 active:scale-95"
        >
          <Plus size={18} className="mr-1.5" />
          Upload Document
        </button>
      </div>

      {/* Upload Modal - Structured like screenshot */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card-standard w-full max-w-lg p-0 overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-[#f3eae0] bg-[#fffdfb]">
              <h2 className="text-lg font-bold text-zinc-800">Upload New Document</h2>
              <button onClick={() => setIsUploadOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-5 bg-white">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-500 text-xs font-bold p-3.5 rounded-xl">
                  {uploadError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#ed7e99]/50 transition-all font-medium"
                  placeholder="e.g., React JS Concept Guide"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">PDF File</label>
                <div 
                  className={`mt-1 flex flex-col items-center justify-center p-8 border-2 border-[#f3eae0] border-dashed rounded-xl transition-all relative group ${uploadFile ? 'bg-[#ffeff2] border-[#ed7e99]/40' : 'hover:border-[#ed7e99]/30 bg-[#fffdfb] hover:bg-[#fffcf9]'}`}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept=".pdf" 
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    required
                  />
                  
                  {uploadFile ? (
                    <div className="text-center space-y-2.5">
                       <div className="w-12 h-12 bg-[#ed7e99] rounded-xl flex items-center justify-center mx-auto shadow-md shadow-[#ed7e99]/20">
                          <File className="text-white" size={22} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-zinc-800 line-clamp-1">{uploadFile.name}</p>
                          <p className="text-xs text-zinc-450">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                       </div>
                       <p className="text-xs text-[#ed7e99] font-bold uppercase tracking-widest">Click to change</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mx-auto text-zinc-400 group-hover:bg-[#ed7e99] group-hover:text-white transition-all">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-600">Choose a file or drag & drop</p>
                        <p className="text-xs text-zinc-400 mt-1">PDF files up to 50MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-[#ed7e99] hover:bg-[#eb6d8a] text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-[#ed7e99]/20 active:scale-95 flex items-center justify-center space-x-1.5"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Upload & Parse</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <Loader2 className="animate-spin text-[#ed7e99] w-10 h-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map(doc => (
            <div key={doc._id} className="card-standard p-5 hover:translate-y-[-4px] transition-all duration-300 group relative">
              <button 
                onClick={() => handleDelete(doc._id)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors z-10 p-1"
                title="Delete Document"
              >
                <Trash2 size={15} />
              </button>

              <div className="w-10 h-10 bg-[#ffeff2] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#ed7e99] transition-all">
                <Files size={20} className="text-[#ed7e99] group-hover:text-white transition-colors" />
              </div>
              
              <div className="space-y-3.5">
                <div>
                  <h3 className="text-base font-bold text-zinc-800 line-clamp-1 group-hover:text-[#ed7e99] transition-colors">{doc.title}</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#fffdfb] rounded-xl p-2 text-center border border-[#f3eae0]">
                    <p className="text-[11px] font-extrabold text-[#ed7e99] mb-0.5">{doc.flashcardCount || 0}</p>
                    <p className="text-[8px] font-bold text-zinc-450 uppercase tracking-tighter">Flashcards</p>
                  </div>
                  <div className="bg-[#fffdfb] rounded-xl p-2 text-center border border-[#f3eae0]">
                    <p className="text-[11px] font-extrabold text-violet-500 mb-0.5">{doc.quizCount || 0}</p>
                    <p className="text-[8px] font-bold text-zinc-450 uppercase tracking-tighter">Quizzes</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-[#f3eae0]">
                  <span className="text-[10px] text-zinc-400 font-bold">
                    Added {new Date(doc.uploadDate).toLocaleDateString()}
                  </span>
                  
                  {doc.status === 'ready' ? (
                    <Link to={`/documents/${doc._id}`} className="text-[10px] font-black text-[#ed7e99] uppercase tracking-widest hover:text-[#eb6d8a] flex items-center">
                      Open <ChevronRight size={13} className="ml-0.5" />
                    </Link>
                  ) : (
                    <span className="text-[10px] font-bold text-[#ed7e99]/70 uppercase tracking-widest flex items-center italic animate-pulse">
                      Parsing...
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {documents.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-white/70 rounded-2xl border border-[#f3eae0] border-dashed shadow-sm">
              <Files className="w-14 h-14 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-zinc-700">Your shelf is empty</h3>
              <p className="text-zinc-450 text-sm mt-1 max-w-xs mx-auto">Upload notes or textbook PDFs to generate AI decks and quizzes instantly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
