# Fix auth imports in all admin API routes
$files = @(
    "src\app\api\admin\newsletter\route.ts",
    "src\app\api\admin\quotes\route.ts",
    "src\app\api\realtime\route.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Replace imports
        $content = $content -replace "import \{ getServerSession \} from 'next-auth/next';", ""
        $content = $content -replace "import \{ auth \} from '~/auth';", "import { auth } from '@/lib/auth/config';"
        
        # Replace session calls
        $content = $content -replace "const session = await getServerSession\(auth\);", "const session = await auth();"
        $content = $content -replace "if \(!session \|\| session\.user\?\.role", "if (!session?.user || session.user.role"
        $content = $content -replace "if \(!session \|\| \(session as any\)\.user\?\.role", "if (!session?.user || session.user.role"
        $content = $content -replace "session\.user!\.id", "session.user.id"
        $content = $content -replace "\(session as any\)\.user!\.id", "session.user.id"
        $content = $content -replace "session\.user!\.email", "session.user.email"
        
        Set-Content $fullPath $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "Auth imports fixed!"
