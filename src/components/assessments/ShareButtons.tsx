'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Linkedin, Twitter, Copy, Check, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function ShareButtons({ assessmentId, assessmentTitle, score }: { assessmentId: string; assessmentTitle: string; score: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrls, setShareUrls] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/share`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { setShareUrls(data); setIsOpen(true); }
    } catch (error) { toast.error('Failed to get share links'); } finally { setLoading(false); }
  };

  const handleCopyLink = async () => {
    if (shareUrls?.shareUrl) { await navigator.clipboard.writeText(shareUrls.shareUrl); setIsCopied(true); toast.success('Link copied!'); setTimeout(() => setIsCopied(false), 2000); }
  };

  const handleDownloadCertificate = async () => {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/certificate`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `certificate_${assessmentTitle.replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch (error) { toast.error('Failed to download certificate'); }
  };

  return (<><Button variant="outline" onClick={handleShare} disabled={loading}><Share2 className="mr-2 h-4 w-4" />{loading ? 'Loading...' : 'Share Result'}</Button><Button variant="outline" onClick={handleDownloadCertificate}><Download className="mr-2 h-4 w-4" />Download Certificate</Button>
  <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Share Your Achievement</DialogTitle></DialogHeader><div className="flex flex-col gap-4 p-4"><div className="flex gap-3 justify-center">{shareUrls?.linkedInUrl && <a href={shareUrls.linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg"><Linkedin className="h-5 w-5" />LinkedIn</a>}{shareUrls?.twitterUrl && <a href={shareUrls.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg"><Twitter className="h-5 w-5" />Twitter</a>}{shareUrls?.whatsappUrl && <a href={shareUrls.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.596 2.058.918 3.149.919h.002c3.18 0 5.767-2.586 5.768-5.766.001-3.181-2.585-5.767-5.767-5.767zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.068-.484-.152-1.064-.476-1.79-.955-.879-.579-1.509-1.252-2.027-1.997-.219-.314-.419-.667-.52-1.023-.108-.377-.067-.727.033-.977.092-.231.237-.417.374-.543.137-.126.226-.206.337-.296.1-.083.157-.13.243-.254.086-.124.143-.25.193-.404.05-.154.031-.277-.016-.385-.047-.108-.223-.534-.38-.733-.151-.191-.305-.2-.443-.204-.124-.003-.266-.003-.408-.003-.142 0-.371.053-.566.265-.195.212-.744.727-.744 1.775 0 1.048.763 2.062.87 2.205.107.143 1.498 2.294 3.637 3.148.508.203.906.324 1.216.415.51.158.974.136 1.341.083.41-.06 1.267-.518 1.446-1.018.179-.5.179-.928.126-1.017-.053-.089-.195-.143-.408-.248-.213-.106-1.259-.622-1.454-.693-.195-.071-.337-.106-.479.106-.142.212-.552.693-.677.835-.125.142-.25.16-.463.053-.213-.107-.899-.332-1.714-1.058-.634-.563-1.062-1.259-1.186-1.472-.124-.213-.013-.328.094-.435.096-.096.213-.249.32-.373.107-.124.142-.213.213-.355.071-.142.036-.266-.018-.373-.054-.107-.479-1.155-.657-1.582-.174-.417-.35-.36-.48-.367-.118-.007-.253-.007-.388-.007-.135 0-.354.051-.54.265-.186.213-.709.693-.709 1.69 0 .997.727 1.96.828 2.095.101.135 1.435 2.19 3.48 3.073.486.21.866.335 1.162.428.496.157.948.135 1.305.082.398-.06 1.267-.518 1.446-1.018.179-.5.179-.928.126-1.017-.053-.089-.195-.143-.408-.248z" /></svg>WhatsApp</a>}</div><div className="flex items-center gap-2 mt-2"><div className="flex-1 p-2 bg-gray-100 rounded text-sm truncate">{shareUrls?.shareUrl}</div><Button variant="outline" size="sm" onClick={handleCopyLink}>{isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div></div></DialogContent></Dialog></>);
}