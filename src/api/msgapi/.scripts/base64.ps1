Function base64
{
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, ValueFromPipeline=$true)][string]$data,
    [Parameter()][switch]$d,
    [ValidateSet("UTF8", "UTF16")]
    [Parameter()][string]$encoding = "UTF8"
)

$enc = [System.Text.Encoding]::UTF8
if($encoding -eq "UTF16") {
    $enc = [System.Text.Encoding]::Unicode
}
if($d.IsPresent) {
    $decoded = $enc.GetString([System.Convert]::FromBase64String($data))
    $decoded
    }
else {
    $encoded = [System.Convert]::ToBase64String($enc.GetBytes($data))
    return $encoded
}

}
