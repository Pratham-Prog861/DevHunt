"use client";

import { useMemo, useState } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeDate, type CommentItem } from "@/lib/devhunt";

type CommentThreadProps = {
  productId: Id<"products">;
};

export function CommentThread({ productId }: CommentThreadProps) {
  const { isSignedIn } = useAuth();
  const comments = useQuery(api.social.listComments, { productId }) as
    | CommentItem[]
    | undefined;
  const createComment = useMutation(api.social.createComment);
  const [body, setBody] = useState("");
  const [replyTarget, setReplyTarget] = useState<Id<"comments"> | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const { roots, repliesByParent } = useMemo(() => {
    const nextRepliesByParent = new Map<string, CommentItem[]>();
    const nextRoots: CommentItem[] = [];

    for (const comment of comments ?? []) {
      if (comment.parentCommentId) {
        const siblings = nextRepliesByParent.get(comment.parentCommentId) ?? [];
        siblings.push(comment);
        nextRepliesByParent.set(comment.parentCommentId, siblings);
      } else {
        nextRoots.push(comment);
      }
    }

    return { roots: nextRoots, repliesByParent: nextRepliesByParent };
  }, [comments]);

  const submitComment = async () => {
    if (!body.trim()) return;
    await createComment({ productId, body });
    setBody("");
  };

  const submitReply = async () => {
    if (!replyTarget || !replyBody.trim()) return;
    await createComment({
      productId,
      body: replyBody,
      parentCommentId: replyTarget,
    });
    setReplyTarget(null);
    setReplyBody("");
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="section-title">Discussion ({comments?.length ?? 0})</h2>

      <div className="ph-card p-4">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you think of this product?"
          className="min-h-[80px] border-gray-200 focus:border-primary"
        />
        <div className="mt-3">
          {isSignedIn ? (
            <Button
              onClick={() => void submitComment()}
              disabled={!body.trim()}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Post comment
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button className="bg-gray-900 hover:bg-gray-800">
                Sign in to comment
              </Button>
            </SignInButton>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {roots.map((comment) => {
          const replies = repliesByParent.get(comment._id) ?? [];

          return (
            <div key={comment._id} className="ph-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {comment.author?.name ?? "Developer"}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{comment.author?.username ?? "maker"} ·{" "}
                    {formatRelativeDate(comment._creationTime)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="text-xs text-gray-500 hover:text-gray-900"
                  onClick={() =>
                    setReplyTarget((current) =>
                      current === comment._id ? null : comment._id,
                    )
                  }
                >
                  Reply
                </Button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {comment.body}
              </p>

              {replyTarget === comment._id && (
                <div className="mt-3 flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
                  <Textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[60px] border-gray-200 focus:border-primary text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => void submitReply()}
                      disabled={!replyBody.trim()}
                      className="bg-gray-900 hover:bg-gray-800 h-8"
                    >
                      Reply
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setReplyTarget(null);
                        setReplyBody("");
                      }}
                      className="h-8"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {replies.length > 0 && (
                <div className="ml-4 mt-3 flex flex-col gap-2 border-l-2 border-gray-100 pl-4">
                  {replies.map((reply) => (
                    <div key={reply._id} className="rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-900">
                        {reply.author?.name ?? "Developer"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{reply.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {(!comments || comments.length === 0) && (
          <div className="ph-card p-8 text-center">
            <p className="text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
