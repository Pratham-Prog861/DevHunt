"use client";

import { useMemo, useState } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AccessibleField } from "@/components/ui/accessible-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AccessibleField id="comment-body" label="Add a comment" srOnlyLabel>
            <Textarea
              id="comment-body"
              name="comment"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="What stood out to you about this product?"
            />
          </AccessibleField>
          {isSignedIn ? (
            <Button className="w-fit" onClick={() => void submitComment()}>
              Post comment
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button className="w-fit">Sign in to comment</Button>
            </SignInButton>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {roots.map((comment) => {
          const replies = repliesByParent.get(comment._id) ?? [];

          return (
            <Card key={comment._id}>
              <CardContent className="flex flex-col gap-4 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {comment.author?.name ?? "Developer"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{comment.author?.username ?? "maker"} {"\u2022"}{" "}
                      {formatRelativeDate(comment._creationTime)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-xs"
                    aria-label={`Reply to ${comment.author?.name ?? "Developer"}`}
                    onClick={() =>
                      setReplyTarget((current) =>
                        current === comment._id ? null : comment._id,
                      )
                    }
                  >
                    Reply
                  </Button>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {comment.body}
                </p>

                {replyTarget === comment._id && (
                  <div className="flex flex-col gap-3 rounded-3xl bg-secondary/70 p-4">
                    <AccessibleField
                      id={`reply-body-${comment._id}`}
                      label="Write a reply"
                      srOnlyLabel
                    >
                      <Textarea
                        id={`reply-body-${comment._id}`}
                        name={`reply-${comment._id}`}
                        value={replyBody}
                        onChange={(event) => setReplyBody(event.target.value)}
                        placeholder="Write a thoughtful reply"
                        className="min-h-24 bg-background"
                      />
                    </AccessibleField>
                    {isSignedIn ? (
                      <Button
                        className="w-fit"
                        onClick={() => void submitReply()}
                      >
                        Reply
                      </Button>
                    ) : (
                      <SignInButton mode="modal">
                        <Button className="w-fit">Sign in to reply</Button>
                      </SignInButton>
                    )}
                  </div>
                )}

                {replies.length > 0 && (
                  <div className="ml-4 flex flex-col gap-3 border-l border-border pl-4">
                    {replies.map((reply) => (
                      <div
                        key={reply._id}
                        className="rounded-3xl bg-secondary/40 p-4"
                      >
                        <p className="text-sm font-medium">
                          {reply.author?.name ?? "Developer"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {reply.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {comments && comments.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No comments yet. Be the first developer to share feedback.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
