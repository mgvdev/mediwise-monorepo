import {
	createManualExam,
	deleteExam as deleteExamRepo,
	getExamById,
	getExamByRawId,
	getExamScanImages,
	listExamsByUser,
	updateExam,
} from "@mediwise-monorepo/infrastructure/exams";
import { TRPCError } from "@trpc/server";
import type { z } from "zod";

import type { examFieldsInput } from "../dto";

type ExamFields = z.infer<typeof examFieldsInput>;

type SessionUser = {
	id: string;
	tenantId?: string | null;
};

function resolveTenantId(user: SessionUser) {
	return user.tenantId ?? null;
}

export async function listExams(params: {
	userId: string;
	search?: string | null;
}) {
	const exams = await listExamsByUser({
		userId: params.userId,
		search: params.search,
	});
	return exams.map((exam) => ({
		id: exam._id,
		title: exam.title,
		examDate: exam.examDate ?? null,
		conclusion: exam.conclusion ?? null,
		doctor: exam.doctor ?? null,
		rawId: exam.rawId ?? null,
		source: exam.source,
		createdAt: exam.createdAt,
	}));
}

export async function getExam(params: { userId: string; id: string }) {
	const exam = await getExamById({ id: params.id, userId: params.userId });
	if (!exam) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found." });
	}
	return {
		id: exam._id,
		title: exam.title,
		examDate: exam.examDate ?? null,
		conclusion: exam.conclusion ?? null,
		doctor: exam.doctor ?? null,
		rawId: exam.rawId ?? null,
		source: exam.source,
		createdAt: exam.createdAt,
		updatedAt: exam.updatedAt ?? null,
	};
}

export async function getExamByRaw(params: { userId: string; rawId: string }) {
	const exam = await getExamByRawId({
		rawId: params.rawId,
		userId: params.userId,
	});
	return exam ? { id: exam._id } : null;
}

export async function saveExam(params: {
	user: SessionUser;
	input: ExamFields & { id?: string | null };
}) {
	const fields: ExamFields = {
		title: params.input.title,
		examDate: params.input.examDate ?? null,
		conclusion: params.input.conclusion ?? null,
		doctor: params.input.doctor ?? null,
	};

	if (params.input.id) {
		const updated = await updateExam({
			id: params.input.id,
			userId: params.user.id,
			fields,
		});
		if (!updated) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found." });
		}
		return { id: updated._id };
	}

	const created = await createManualExam({
		userId: params.user.id,
		tenantId: resolveTenantId(params.user),
		fields,
	});
	return { id: created._id };
}

export async function deleteExam(params: { userId: string; id: string }) {
	const deleted = await deleteExamRepo({
		id: params.id,
		userId: params.userId,
	});
	if (!deleted) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found." });
	}
	return { id: params.id, deleted: true };
}

export async function getExamScan(params: { userId: string; id: string }) {
	const images = await getExamScanImages({
		id: params.id,
		userId: params.userId,
	});
	return { images };
}
