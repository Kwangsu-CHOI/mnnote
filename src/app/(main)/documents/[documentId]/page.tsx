import { getDocument } from "@/actions/update-document";
import { notFound } from "next/navigation";
import { DocumentPage } from "./_components/document-page";

interface DocumentIdPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

const DocumentIdPage = async ({ params }: DocumentIdPageProps) => {
  const { documentId } = await params;
  const document = await getDocument(documentId).catch(() => null);

  if (!document) {
    notFound();
  }

  return (
    <DocumentPage document={document} />
  );
};

export default DocumentIdPage;
