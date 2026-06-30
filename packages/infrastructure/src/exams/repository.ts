import { randomUUID } from "node:crypto";

import { Exam, PrescriptionRaw } from "@mediwise-monorepo/db";

import { createStorageProvider } from "../prescriptions/storage";
import type { PrescriptionRawDoc } from "../prescriptions/types";
import type { ExamDoc, ExamFields, ExamScanImage, ExamSource } from "./types";

/**
 * Create or update the exam extracted from a scanned document. Keyed by rawId
 * so a queue retry / re-extraction doesn't create duplicates.
 */
export async function upsertExamFromScan(input: {
	userId: string;
	tenantId: string | null;
	rawId: string;
	source: ExamSource;
	fields: ExamFields;
}) {
	const now = new Date();
	const doc = await Exam.findOneAndUpdate(
		{ rawId: input.rawId, userId: input.userId },
		{
			$set: {
				tenantId: input.tenantId,
				title: input.fields.title,
				examDate: input.fields.examDate ?? null,
				conclusion: input.fields.conclusion ?? null,
				doctor: input.fields.doctor ?? null,
				source: input.source,
				updatedAt: now,
			},
			$setOnInsert: {
				_id: randomUUID(),
				userId: input.userId,
				rawId: input.rawId,
				createdAt: now,
			},
		},
		{ upsert: true, new: true },
	).lean<ExamDoc | null>();
	return doc;
}

export async function createManualExam(input: {
	userId: string;
	tenantId: string | null;
	fields: ExamFields;
}) {
	const now = new Date();
	const doc: ExamDoc = {
		_id: randomUUID(),
		userId: input.userId,
		tenantId: input.tenantId,
		rawId: null,
		title: input.fields.title,
		examDate: input.fields.examDate ?? null,
		conclusion: input.fields.conclusion ?? null,
		doctor: input.fields.doctor ?? null,
		source: "manual",
		createdAt: now,
		updatedAt: now,
	};
	await Exam.create(doc);
	return doc;
}

export async function listExamsByUser(input: {
	userId: string;
	search?: string | null;
}) {
	const filter: Record<string, unknown> = { userId: input.userId };
	const search = input.search?.trim();
	if (search) {
		const rx = new RegExp(escapeRegExp(search), "i");
		filter.$or = [{ title: rx }, { conclusion: rx }, { doctor: rx }];
	}
	// Most recent exam first; fall back to creation date when examDate is unset.
	return Exam.find(filter)
		.sort({ examDate: -1, createdAt: -1 })
		.lean<ExamDoc[]>();
}

export async function getExamById(input: { id: string; userId: string }) {
	return Exam.findOne({
		_id: input.id,
		userId: input.userId,
	}).lean<ExamDoc | null>();
}

export async function getExamByRawId(input: { rawId: string; userId: string }) {
	return Exam.findOne({
		rawId: input.rawId,
		userId: input.userId,
	}).lean<ExamDoc | null>();
}

export async function updateExam(input: {
	id: string;
	userId: string;
	fields: ExamFields;
}) {
	return Exam.findOneAndUpdate(
		{ _id: input.id, userId: input.userId },
		{
			$set: {
				title: input.fields.title,
				examDate: input.fields.examDate ?? null,
				conclusion: input.fields.conclusion ?? null,
				doctor: input.fields.doctor ?? null,
				updatedAt: new Date(),
			},
		},
		{ new: true },
	).lean<ExamDoc | null>();
}

export async function deleteExam(input: { id: string; userId: string }) {
	const res = await Exam.deleteOne({ _id: input.id, userId: input.userId });
	return res.deletedCount > 0;
}

/**
 * Read the scanned pages linked to an exam and return them as base64 images,
 * so the native app can display the full scan without a public file URL.
 */
export async function getExamScanImages(input: {
	id: string;
	userId: string;
}): Promise<ExamScanImage[]> {
	const exam = await Exam.findOne({
		_id: input.id,
		userId: input.userId,
	}).lean<ExamDoc | null>();
	if (!exam?.rawId) return [];

	const raw = await PrescriptionRaw.findOne({
		_id: exam.rawId,
		userId: input.userId,
	}).lean<PrescriptionRawDoc | null>();
	if (!raw) return [];

	const storage = createStorageProvider();
	const keys = raw.storageKeys?.length ? raw.storageKeys : [raw.storageKey];
	const images: ExamScanImage[] = [];
	for (const key of keys) {
		try {
			const buffer = await storage.getFileBuffer(key);
			images.push({
				base64: buffer.toString("base64"),
				contentType: raw.contentType,
			});
		} catch {
			// Skip pages that can't be read rather than failing the whole request.
		}
	}
	return images;
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
