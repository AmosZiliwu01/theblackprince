<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
The public root page is the editable official-links hub; keep shopping content at /store so shared links open to the curated directory first.
Community links carry group, description, and optional note in their existing table; render from live records so admins control homepage content without code changes.
Link group names and order live in a separate admin-managed table; why: group presentation must remain editable without code changes.
Trade WhatsApp numbers live in an owner-only contact table, never on publicly readable offers; why: prospective traders communicate through private in-site chat without exposing phone numbers.
Trade access uses a reusable in-page identity dialog backed by persistent auth; why: making offers and chatting should not detour through a separate login page.
Homepage payment methods and store CTA content live in website settings; why: the admin can enable optional payment information and edit copy without deploying code.
