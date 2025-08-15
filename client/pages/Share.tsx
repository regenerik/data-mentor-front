import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Share as ShareIcon,
  Mail,
  Plus,
  X,
  Send,
  FileText,
  Users,
  Trash2,
  Eye,
} from "lucide-react";

import courseStore from "../store/stores/courseStore";
import { courseActions } from "../store";

export default function Share() {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pdfData, setPdfData] = useState<{
    blob: Blob | null;
    fileName: string;
    objectUrl: string;
  }>({
    blob: null,
    fileName: "",
    objectUrl: "",
  });

  useEffect(() => {
    const { blob, fileName, objectUrl } = courseStore.getSharePdf();
    setPdfData({ blob, fileName, objectUrl });
    // ✅ blob: para FormData -> fd.append("file", blob, fileName)
    // ✅ objectUrl: para preview <iframe src={objectUrl} />
  }, []);

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(currentEmail));
  }, [currentEmail]);

  const handleAddEmail = () => {
    if (isEmailValid && currentEmail && !emails.includes(currentEmail)) {
      setEmails((prev) => [...prev, currentEmail]);
      setCurrentEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isEmailValid) {
      handleAddEmail();
    }
  };

  const handleSendPDF = async () => {
    if (!pdfData.blob || emails.length === 0) {
      alert("Please ensure you have a PDF file and at least one email address.");
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("file", pdfData.blob, pdfData.fileName);
      formData.append("emails", JSON.stringify(emails));

      // Console log for debugging as requested
      console.log("📧 Sending PDF to emails:", {
        fileName: pdfData.fileName,
        emailCount: emails.length,
        emails: emails,
        blobSize: pdfData.blob.size,
        formData: formData,
      });

      // Backend endpoint (placeholder as requested)
      const response = await fetch("https://your-backend-api.com/send-pdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert(`PDF sent successfully to ${emails.length} recipients!`);
        // Clear emails after successful send
        setEmails([]);
        // Clear PDF data as requested
        courseActions.clearSharePdf();
        setPdfData({ blob: null, fileName: "", objectUrl: "" });
      } else {
        throw new Error("Failed to send PDF");
      }
    } catch (error) {
      console.error("Error sending PDF:", error);
      alert("Failed to send PDF. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/course-editor"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <ShareIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Share Content
              </h1>
              <p className="text-sm text-muted-foreground">
                Send PDF content via email to multiple recipients
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-neon-green/3 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Email Management */}
          <div className="space-y-6">
            {/* PDF File Info */}
            <Card className="border-border shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  PDF File Ready
                </CardTitle>
                <CardDescription>
                  {pdfData.fileName || "No PDF file available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pdfData.blob ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                    <FileText className="h-8 w-8 text-neon-green" />
                    <div>
                      <p className="font-medium text-foreground">
                        {pdfData.fileName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Size: {(pdfData.blob.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <FileText className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">
                        No PDF file available
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please generate a PDF first from the Course Editor
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Management */}
            <Card className="border-border shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Email Recipients ({emails.length})
                </CardTitle>
                <CardDescription>
                  Add email addresses to send the PDF content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email-input" className="text-foreground">
                    Add Email Address
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-input"
                        type="email"
                        placeholder="example@domain.com"
                        value={currentEmail}
                        onChange={(e) => setCurrentEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className={`pl-10 bg-background/50 ${
                          currentEmail
                            ? isEmailValid
                              ? "border-neon-green/50"
                              : "border-destructive/50"
                            : "border-border/50"
                        }`}
                      />
                    </div>
                    <Button
                      onClick={handleAddEmail}
                      disabled={!isEmailValid || emails.includes(currentEmail)}
                      className="bg-primary/90 hover:bg-primary"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {currentEmail && !isEmailValid && (
                    <p className="text-sm text-destructive">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                {/* Email List */}
                <div className="space-y-2">
                  <Label className="text-foreground">Recipients List</Label>
                  {emails.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {emails.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20"
                        >
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">
                              {email}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEmail(email)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 rounded-lg bg-muted/50 border border-border/50">
                      <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No recipients added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendPDF}
                  disabled={!pdfData.blob || emails.length === 0 || isSending}
                  className="w-full bg-primary/90 hover:bg-primary"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send PDF to {emails.length} Recipients
                    </>
                  )}
                </Button>

                {/* Clear All Button */}
                {emails.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setEmails([])}
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Recipients
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - PDF Preview */}
          <div>
            <Card className="border-border shadow-xl bg-card/80 backdrop-blur-sm h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  PDF Preview
                </CardTitle>
                <CardDescription>
                  Preview of the content that will be sent
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {pdfData.objectUrl ? (
                  <iframe
                    src={pdfData.objectUrl}
                    className="w-full h-[calc(100vh-350px)] border-0 rounded-b-lg"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[calc(100vh-350px)] text-center">
                    <div>
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No PDF Available
                      </h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Generate a PDF from the Course Editor first to preview
                        and share your content.
                      </p>
                      <Link to="/course-editor">
                        <Button className="mt-4" variant="outline">
                          Go to Course Editor
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
