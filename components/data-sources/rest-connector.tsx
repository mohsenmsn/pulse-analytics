"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2, Wand2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRestDataSource } from "@/app/actions/data-sources";

export function RestConnector() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [dataPath, setDataPath] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function useDemoEndpoint() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    setUrl(`${origin}/api/mock/metrics`);
    if (!name) setName("Demo REST metrics");
  }

  async function handleConnect() {
    setError(null);
    if (!url.trim()) {
      setError("Enter an endpoint URL.");
      return;
    }
    setPending(true);
    const result = await createRestDataSource({
      name,
      url: url.trim(),
      dataPath: dataPath.trim() || undefined,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setUrl("");
    setDataPath("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4 text-primary" />
          REST API connector
        </CardTitle>
        <CardDescription>
          Pull a JSON array of records from an HTTP endpoint.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rest-name">Source name</Label>
          <Input
            id="rest-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Product API"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rest-url">Endpoint URL</Label>
          <Input
            id="rest-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/metrics"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rest-path">
            Data path <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="rest-path"
            value={dataPath}
            onChange={(e) => setDataPath(e.target.value)}
            placeholder="data.results"
          />
          <p className="text-xs text-muted-foreground">
            Dot path to the array inside the response, if it isn&apos;t at the
            top level.
          </p>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleConnect} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Connect
          </Button>
          <Button type="button" variant="outline" onClick={useDemoEndpoint}>
            <Wand2 className="h-4 w-4" />
            Use demo endpoint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
