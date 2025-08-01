import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_URL } from "@/http/api";
import axiosIntense from "@/http/axios";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Certificate = () => {
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const id = params.id;

  const getCertificate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosIntense.get(`/certificate/${id}`);
      if (data.status === "success") {
        setCertificate(data.data);
      } else {
        setError(data.message || "Failed to fetch certificate.");
      }
    } catch (err) {
      console.error("Certificate fetch error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getCertificate();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex w-full justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-32 mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              Failed to load certificate details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button onClick={getCertificate} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Certificate Not Found</CardTitle>
            <CardDescription>
              The certificate with ID "{id}" could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please check the URL or try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownload = () => {
    const downloadUrl = `${BASE_URL}${certificate.certificate}`;
    window.open(downloadUrl, "_blank");
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-10 space-y-10 text-gray-700 dark:text-gray-200">
          {/* Talaba haqida */}
          <section>
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
              🎓 Talaba Maʼlumotlari
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Info label="Ismi" value={certificate.student.username} />
              <Info label="Email" value={certificate.student.email} />
              <Info label="Talaba ID" value={certificate.student._id} />
              {certificate.student.role && (
                <Info label="Roli" value={certificate.student.role} />
              )}
            </div>
          </section>

          {/* Muallif haqida */}
          <section>
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
              ✍️ Muallif Maʼlumotlari
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Info label="Ismi" value={certificate.author.username} />
              <Info label="Email" value={certificate.author.email} />
              <Info label="Muallif ID" value={certificate.author._id} />
              {certificate.author.role && (
                <Info label="Roli" value={certificate.author.role} />
              )}
            </div>
          </section>

          {/* Vaqtlar */}
          <section>
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
              🕒 Yaratilgan Vaqtlari
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Info
                label="Yaratilgan sana"
                value={format(new Date(certificate.createdAt), "PPP p")}
              />
              <Info
                label="Oxirgi yangilanish"
                value={format(new Date(certificate.updatedAt), "PPP p")}
              />
            </div>
          </section>

          {/* Yuklab olish tugmasi */}
          <div className="pt-6 flex justify-center">
            <Button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-xl transition-all duration-200"
            >
              📄 PDF Sertifikatni Yuklab Olish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-lg font-semibold break-words">{value}</p>
  </div>
);

export default Certificate;
