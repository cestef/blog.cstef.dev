"use client";

import { useState } from "react";
import useSWR from "swr";

export interface Comment {
	id: string;
	created_at: number;
	referer: string;
	text: string;
	user: {
		id: string;
		name: string;
		image: string;
	};
}

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useComment = () => {
	const [text, setText] = useState("");
	const { data: comments, mutate } = useSWR<Comment[]>("/api/comment/get", fetcher, {
		fallbackData: [],
	});
	console.log(comments);
	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!text) return;
		const trimmedText = text.trim();
		if (!trimmedText) return;
		const sanitizedText = trimmedText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		if (sanitizedText.length > 500) return;

		try {
			await fetch("/api/comment/post", {
				method: "POST",
				body: JSON.stringify({ text }),
				headers: {
					"Content-Type": "application/json",
				},
			});
			setText("");
			await mutate();
		} catch (error) {
			console.log(error);
		}
	};
	const onDelete = async (comment: Comment) => {
		try {
			await fetch("/api/comment/delete", {
				method: "POST",
				body: JSON.stringify({ comment }),
				headers: {
					"Content-Type": "application/json",
				},
			});
			await mutate();
		} catch (error) {
			console.log(error);
		}
	};
	return { text, setText, comments, onSubmit, onDelete };
};

export default useComment;
