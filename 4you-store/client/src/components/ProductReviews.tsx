import React, { useState } from 'react';
import { sdk } from '../utils/sdk';
import { Star } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  user?: { name: string | null };
}

export const ProductReviews: React.FC<{ productId: number }> = ({ productId }) => {
  const { data: reviews, refetch } = sdk.reviews.list.useQuery({ productId });
  const { data: user } = sdk.auth.me.useQuery();
  const addReview = sdk.reviews.add.useMutation({
    onSuccess: () => {
      refetch();
      setRating(5);
      setTitle('');
      setComment('');
      setShowForm(false);
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview.mutate({ productId, rating, title, comment });
  };

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">تقييمات العملاء</h2>
        {user && !showForm && (
          <Button onClick={() => setShowForm(true)}>أضف تقييمك</Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
          <div className="mb-4">
            <label className="block mb-2 font-medium">التقييم</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`cursor-pointer ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">عنوان التقييم</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: منتج رائع" />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">تعليقك</label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب رأيك هنا..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={addReview.isLoading}>إرسال</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {reviews?.map((review: Review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="font-bold">{review.title}</span>
            </div>
            <p className="text-gray-600 mb-2">{review.comment}</p>
            <div className="text-sm text-gray-400">
              بواسطة {review.user?.name || 'عميل'} في {new Date(review.createdAt).toLocaleDateString('ar-EG')}
            </div>
          </div>
        ))}
        {reviews?.length === 0 && <p className="text-gray-500">لا توجد تقييمات بعد. كن أول من يقيم!</p>}
      </div>
    </div>
  );
};
