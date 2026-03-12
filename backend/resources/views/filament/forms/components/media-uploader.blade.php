@php
    $targetField  = $field->getTargetField();
    $accept       = $field->getAccept();
    $label        = $field->getLabel();
    $uploadUrl    = route('admin.media.upload');
@endphp

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        x-data="{
            uploading: false,
            done: false,
            error: null,
            filename: null,
            async upload(e) {
                const file = e.target.files[0];
                if (!file) return;
                this.uploading = true;
                this.done     = false;
                this.error    = null;
                this.filename = file.name;
                try {
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('_token', document.querySelector('meta[name=csrf-token]').content);
                    const res  = await fetch('{{ $uploadUrl }}', { method: 'POST', body: fd });
                    const json = await res.json();
                    if (json.url) {
                        $wire.set('data.{{ $targetField }}', json.url);
                        this.done = true;
                    } else {
                        this.error = json.message ?? 'Upload failed.';
                    }
                } catch (err) {
                    this.error = err.message;
                } finally {
                    this.uploading = false;
                }
            }
        }"
        class="flex flex-col gap-2"
    >
        <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 w-fit">
            <input
                type="file"
                accept="{{ $accept }}"
                class="hidden"
                @change="upload"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
            </svg>
            <span x-show="!uploading && !done">Choose file…</span>
            <span x-show="uploading">Uploading…</span>
            <span x-show="done" class="text-green-600 dark:text-green-400">✓ Uploaded!</span>
        </label>

        <p x-show="filename && !error" x-text="filename" class="text-xs text-gray-500 dark:text-gray-400"></p>
        <p x-show="error" x-text="error" class="text-xs text-red-600 dark:text-red-400"></p>
    </div>
</x-dynamic-component>
