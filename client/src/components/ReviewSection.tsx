import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Star, Camera, X, CheckCircle, MessageSquare } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewSectionProps {
  productId: number;
}

function StarRating({ rating, size = "sm", interactive = false, onChange }: {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const sizeMap = { sm: "w-3 h-3", md: "w-3.5 h-3.5", lg: "w-4 h-4" };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-all duration-200`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(star)}
        >
          <Star
            className={`${sizeMap[size]} transition-all duration-200 ${
              star <= (hovered || rating)
                ? "fill-black text-black"
                : "text-black/10 fill-transparent"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ count, total, stars }: { count: number; total: number; stars: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-sans text-black/30 w-4 text-center">{stars}</span>
      <Star className="w-2.5 h-2.5 fill-black text-black" />
      <div className="flex-1 h-[2px] bg-black/[0.04] overflow-hidden">
        <div className="h-full bg-black transition-all duration-700" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-[10px] font-sans text-black/20 w-6 text-end tabular-nums">{count}</span>
    </div>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const { t, isRTL } = useLanguage();
  const utils = trpc.useUtils();

  const { data: reviews = [], isLoading: loadingReviews } = trpc.reviews.byProduct.useQuery({ productId });
  const { data: stats } = trpc.reviews.stats.useQuery({ productId });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.byProduct.invalidate({ productId });
      utils.reviews.stats.invalidate({ productId });
      toast.success(isRTL ? "تم إضافة تقييمك بنجاح" : "Review submitted");
      resetForm();
    },
    onError: (err) => {
      toast.error(err.message || (isRTL ? "فشل في إضافة التقييم" : "Failed to submit review"));
    },
  });

  const uploadImage = trpc.reviews.uploadImage.useMutation();
  const deleteReview = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      utils.reviews.byProduct.invalidate({ productId });
      utils.reviews.stats.invalidate({ productId });
      toast.success(isRTL ? "تم حذف التقييم" : "Review deleted");
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setShowForm(false);
    setRating(0);
    setTitle("");
    setComment("");
    setImages([]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(isRTL ? "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" : "Image must be under 5MB");
          continue;
        }
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(file);
        });
        const result = await uploadImage.mutateAsync({ base64, filename: file.name, contentType: file.type });
        setImages((prev) => [...prev, result.url]);
      }
    } catch {
      toast.error(isRTL ? "فشل في رفع الصورة" : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(isRTL ? "يرجى اختيار تقييم" : "Please select a rating");
      return;
    }
    createReview.mutate({
      productId,
      rating,
      title: title || undefined,
      comment: comment || undefined,
      imageUrls: images.length > 0 ? images : undefined,
    });
  };

  const avgRating = stats?.averageRating ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const distribution = stats?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="mt-20 pt-16 border-t border-black/[0.04]">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[9px] font-sans tracking-luxury uppercase text-black/25 mb-2">
            {isRTL ? "آراء العملاء" : "Customer Reviews"}
          </p>
          <h2 className="font-heading text-2xl md:text-3xl italic">
            {isRTL ? "التقييمات والمراجعات" : "Reviews"}
          </h2>
        </div>
        {isAuthenticated && (
          <Button
            variant="outline"
            className="rounded-none text-[10px] font-sans tracking-luxury uppercase gap-2 px-6 border-black/15 hover:bg-black hover:text-white transition-all duration-300"
            onClick={() => setShowForm(!showForm)}
          >
            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
            {isRTL ? "اكتب تقييم" : "Write a Review"}
          </Button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="flex flex-col items-center justify-center text-center py-8 border border-black/[0.04]">
          <div className="text-4xl font-sans font-light mb-2 tabular-nums">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </div>
          <StarRating rating={Math.round(avgRating)} size="md" />
          <p className="text-[11px] font-sans text-black/25 mt-2.5">
            {totalReviews} {isRTL ? "تقييم" : totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="md:col-span-2 flex flex-col justify-center space-y-2 px-4">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar
              key={stars}
              stars={stars}
              count={distribution[stars as keyof typeof distribution] || 0}
              total={totalReviews}
            />
          ))}
        </div>
      </div>

      {/* Review Form */}
      {showForm && isAuthenticated && (
        <div className="mb-12 p-6 md:p-8 border border-black/[0.06] animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="font-heading text-lg italic mb-6">
            {isRTL ? "شاركنا رأيك" : "Share Your Experience"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-3 block">
                {isRTL ? "تقييمك" : "Your Rating"} *
              </label>
              <StarRating rating={rating} size="lg" interactive onChange={setRating} />
            </div>

            <div>
              <label className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">
                {isRTL ? "عنوان التقييم" : "Review Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRTL ? "ملخص تجربتك..." : "Summarize your experience..."}
                className="w-full px-4 py-3 bg-white border border-black/[0.08] text-[13px] font-sans focus:outline-none focus:border-black/20 transition-all duration-300 placeholder:text-black/20"
              />
            </div>

            <div>
              <label className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">
                {isRTL ? "تفاصيل التقييم" : "Review Details"}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isRTL ? "شاركنا تجربتك مع هذا المنتج..." : "Tell us about your experience..."}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-black/[0.08] text-[13px] font-sans focus:outline-none focus:border-black/20 transition-all duration-300 placeholder:text-black/20 resize-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-3 block">
                {isRTL ? "أضف صور" : "Add Photos"}
              </label>
              <div className="flex flex-wrap gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 overflow-hidden border border-black/[0.06] group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-16 h-16 border border-dashed border-black/10 flex items-center justify-center hover:border-black/30 transition-colors"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border border-black/20 border-t-black animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-black/20" strokeWidth={1.5} />
                    )}
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={createReview.isPending || rating === 0}
                className="rounded-none font-sans text-[10px] tracking-luxury uppercase px-8 h-10 bg-black hover:bg-black/90 text-white"
              >
                {createReview.isPending ? (isRTL ? "جاري الإرسال..." : "Submitting...") : (isRTL ? "إرسال التقييم" : "Submit Review")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-none font-sans text-[10px] tracking-luxury uppercase px-6 h-10 border-black/10 hover:bg-black/[0.03]"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Not logged in prompt */}
      {!isAuthenticated && (
        <div className="mb-12 py-8 text-center border border-black/[0.04]">
          <p className="text-[12px] font-sans text-black/30 mb-4">
            {isRTL ? "سجل دخولك لكتابة تقييم" : "Sign in to write a review"}
          </p>
          <Button
            variant="outline"
            className="rounded-none font-sans text-[10px] tracking-luxury uppercase px-8 h-10 border-black/15 hover:bg-black hover:text-white transition-all duration-300"
            onClick={() => { window.location.href = getLoginUrl(); }}
          >
            {isRTL ? "تسجيل الدخول" : "Sign In"}
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {loadingReviews ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse py-6 border-b border-black/[0.04]">
              <div className="h-3 bg-[#f5f5f5] w-24 mb-3" />
              <div className="h-4 bg-[#f5f5f5] w-1/3 mb-2" />
              <div className="h-3 bg-[#f5f5f5] w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-0">
          {reviews.map((review) => (
            <div key={review.id} className="py-8 border-b border-black/[0.04] last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <StarRating rating={review.rating} size="sm" />
                    {review.title && (
                      <span className="text-[13px] font-sans font-medium">{review.title}</span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-[12px] font-sans text-black/40 leading-relaxed mb-4 italic">
                      "{review.comment}"
                    </p>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((img, i) => (
                        <div key={i} className="w-14 h-14 overflow-hidden border border-black/[0.04]">
                          <img src={img.url} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-black/[0.04] flex items-center justify-center text-[8px] font-sans font-medium text-black/40">
                        {review.userInitial || "?"}
                      </div>
                      <span className="text-[10px] font-sans text-black/30">{review.userName || (isRTL ? "مجهول" : "Anonymous")}</span>
                    </div>
                    <span className="text-[9px] font-sans text-black/15">
                      {new Date(review.createdAt).toLocaleDateString(isRTL ? "ar" : "en", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-sans text-black/20">
                      <CheckCircle className="w-2.5 h-2.5" strokeWidth={1.5} />
                      {isRTL ? "مشتري موثق" : "Verified"}
                    </span>
                  </div>
                </div>

                {user?.id === review.userId && (
                  <button
                    onClick={() => deleteReview.mutate({ reviewId: review.id })}
                    className="text-black/15 hover:text-black transition-colors p-1"
                  >
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[12px] font-sans text-black/20 italic">
            {isRTL ? "لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج." : "No reviews yet. Be the first to review this product."}
          </p>
        </div>
      )}
    </div>
  );
}
