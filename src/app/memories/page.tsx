'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, MapPin, Clock, Eye, EyeOff, ExternalLink, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PastGift {
  id: string;
  title: string;
  recipient_name: string;
  message: string;
  created_at: string;
  is_opened: boolean;
  opened_at?: string;
  reservation_details?: {
    venue: string;
    dateTime: string;
    city: string;
    type: string;
  };
}

export default function MemoriesPage() {
  const [gifts, setGifts] = useState<PastGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string } } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [editingGift, setEditingGift] = useState<PastGift | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Auth error:', error);
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(!!user);
          setUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase.auth]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchPastGifts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('gifts')
          .select('*')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching past gifts:', error);
          setError('Failed to load past gifts');
          return;
        }

        setGifts(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPastGifts();
    }
  }, [user, supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeString;
    }
  };

  const openGift = (giftId: string) => {
    window.open(`/gift/${giftId}`, '_blank');
  };

  const handleEdit = (gift: PastGift) => {
    setEditingGift(gift);
  };

  const handleDelete = async (giftId: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', giftId);

      if (error) {
        console.error('Error deleting gift:', error);
        setError('Failed to delete memory');
        return;
      }

      // Remove from local state
      setGifts(prev => prev.filter(gift => gift.id !== giftId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateGift = async (updatedGift: Partial<PastGift>) => {
    if (!editingGift) return;

    try {
      const { error } = await supabase
        .from('gifts')
        .update({
          title: updatedGift.title,
          message: updatedGift.message,
          recipient_name: updatedGift.recipient_name,
          reservation_details: updatedGift.reservation_details
        })
        .eq('id', editingGift.id);

      if (error) {
        console.error('Error updating gift:', error);
        setError('Failed to update memory');
        return;
      }

      // Update local state
      setGifts(prev => prev.map(gift => 
        gift.id === editingGift.id 
          ? { ...gift, ...updatedGift }
          : gift
      ));
      setEditingGift(null);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your memories...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-black">
      {/* Header */}
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button 
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Calendar className="w-10 h-10 text-blue-600" />
              Past Memories
            </h1>
            <p className="text-xl text-gray-600">
              Your previous gifts and experiences
            </p>
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your memories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                No memories yet
              </h3>
              <p className="text-gray-500 mb-6 text-lg">
                Create your first gift to see it here!
              </p>
              <Button 
                onClick={() => router.push('/create')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-blue-600 hover:to-emerald-500 text-white"
              >
                Create Your First Gift
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {gifts.map((gift, index) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-3 text-gray-900">
                            {gift.title}
                          </h3>
                          <div className="flex items-center gap-6 text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5" />
                              <span className="font-medium">{gift.recipient_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5" />
                              <span>Created {formatDate(gift.created_at)}</span>
                            </div>
                          </div>
                          {gift.reservation_details && (
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <MapPin className="w-5 h-5" />
                              <span className="font-medium">
                                {gift.reservation_details.venue} • {gift.reservation_details.city}
                              </span>
                            </div>
                          )}
                          {gift.reservation_details?.dateTime && (
                            <div className="text-gray-600 mb-4">
                              <strong>When:</strong> {formatDateTime(gift.reservation_details.dateTime)}
                            </div>
                          )}
                          {gift.message && (
                            <p className="text-gray-700 mb-6 line-clamp-3 text-lg leading-relaxed">
                              {gift.message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <Badge 
                            variant={gift.is_opened ? "default" : "secondary"}
                            className="flex items-center gap-2 px-3 py-1 text-sm"
                          >
                            {gift.is_opened ? (
                              <>
                                <Eye className="w-4 h-4" />
                                Opened
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Unopened
                              </>
                            )}
                          </Badge>
                          {gift.is_opened && gift.opened_at && (
                            <span className="text-sm text-gray-500">
                              Opened {formatDate(gift.opened_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => openGift(gift.id)}
                          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-blue-600 hover:to-emerald-500 text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Gift
                        </Button>
                        <Button
                          onClick={() => handleEdit(gift)}
                          variant="outline"
                          className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm(gift.id)}
                          variant="outline"
                          className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingGift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Memory</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateGift({
                title: formData.get('title') as string,
                message: formData.get('message') as string,
                recipient_name: formData.get('recipient_name') as string,
                reservation_details: {
                  ...editingGift.reservation_details,
                  venue: formData.get('venue') as string,
                  city: formData.get('city') as string,
                  dateTime: formData.get('dateTime') as string,
                  type: editingGift.reservation_details?.type || 'experience'
                }
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    name="title"
                    defaultValue={editingGift.title}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Recipient Name</label>
                  <input
                    name="recipient_name"
                    defaultValue={editingGift.recipient_name}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    name="message"
                    defaultValue={editingGift.message}
                    className="w-full p-2 border rounded-md h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Venue</label>
                  <input
                    name="venue"
                    defaultValue={editingGift.reservation_details?.venue || ''}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    name="city"
                    defaultValue={editingGift.reservation_details?.city || ''}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input
                    name="dateTime"
                    type="datetime-local"
                    defaultValue={editingGift.reservation_details?.dateTime ? 
                      new Date(editingGift.reservation_details.dateTime).toISOString().slice(0, 16) : ''}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingGift(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Memory</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this memory? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button 
                onClick={() => setShowDeleteConfirm(null)}
                variant="outline" 
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
